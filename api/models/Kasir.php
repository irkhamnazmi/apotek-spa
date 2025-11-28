<?php
require_once __DIR__ . "/../config/Database.php";

class Kasir
{
    private $conn;

    public function __construct()
    {
        $this->conn = Database::getConnection();
    }

    // ==================================================
    // GENERATE NO STRUK
    // ==================================================
    public function generateNoStruk()
    {
        $bln = date("m");
        $thn = date("y");

        $sql = "
            SELECT no_struk FROM kasir
            WHERE no_struk LIKE '%/$bln/$thn'
            ORDER BY id_kasir DESC
            LIMIT 1
        ";

        $res = $this->conn->query($sql);
        $last = $res->fetch_assoc();

        if ($last) {
            $lastNumber = intval(substr($last['no_struk'], 0, 4));
            $nextNumber = str_pad($lastNumber + 1, 4, "0", STR_PAD_LEFT);
        } else {
            $nextNumber = "0001";
        }

        return "{$nextNumber}/{$bln}/{$thn}";
    }

    // ==================================================
    // GET ALL
    // ==================================================
    public function getAll()
    {
        $sql = "SELECT a.*, us.username, jp.nama_jenis_pembayaran
                FROM kasir a
                LEFT JOIN users us ON us.id_user = a.id_user
                LEFT JOIN jenis_pembayaran jp ON jp.id_jenis_pembayaran = a.id_jenis_pembayaran
                ORDER BY a.id_kasir DESC";

        $data = [];
        $res = $this->conn->query($sql);

        while ($row = $res->fetch_assoc()) {
            $data[] = $row;
        }

        return $data;
    }

    // ==================================================
    // GET BY ID
    // ==================================================


    public function getById($id)
    {
        $stmt = $this->conn->prepare("
        SELECT 
            kd.id_kasir_detail,
            kd.id_kasir,
            kd.id_stok_opname,
            kd.qty,
            kd.subtotal,
            so.nama_barang,
            so.harga_jual,
            so.id_barang
        FROM kasir_detail kd
        LEFT JOIN stok_opname so 
            ON so.id_stok_opname = kd.id_stok_opname
        WHERE kd.id_kasir = ?
        ORDER BY kd.id_stok_opname ASC
    ");

        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();

        $detail = [];
        while ($row = $result->fetch_assoc()) {
            $detail[] = $row;
        }

        return $detail;
    }

    // ==================================================
    // CREATE
    // ==================================================
    public function create($d)
    {
        $this->conn->begin_transaction();

        try {
            // Generate no struk jika kosong
            if (empty($d['no_struk'])) {
                $d['no_struk'] = $this->generateNoStruk();
            }

            // INSERT HEADER
            $stmt = $this->conn->prepare("
                INSERT INTO kasir(no_struk, waktu, id_jenis_pembayaran, total, bayar, kembali, id_user)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");

            $stmt->bind_param(
                "ssidddi",
                $d['no_struk'],
                $d['waktu'],
                $d['id_jenis_pembayaran'],
                $d['total'],
                $d['bayar'],
                $d['kembali'],
                $d['id_user']
            );
            $stmt->execute();
            $id_kasir = $stmt->insert_id;

            // INSERT DETAIL TANPA id_barang
            foreach ($d['kasir_detail'] as $item) {

                $stmtDetail = $this->conn->prepare("
                    INSERT INTO kasir_detail(id_kasir, id_stok_opname, qty, subtotal)
                    VALUES (?, ?, ?, ?)
                ");
                $stmtDetail->bind_param(
                    "iiid",
                    $id_kasir,
                    $item['id_stok_opname'],
                    $item['qty'],
                    $item['subtotal']
                );
                $stmtDetail->execute();

                // Kurangi stok
                $this->conn->query("
                    UPDATE stok_opname 
                    SET stok_rak = stok_rak - {$item['qty']}
                    WHERE id_stok_opname = {$item['id_stok_opname']}
                ");
            }

            $this->conn->commit();
            return true;
        } catch (\Exception $e) {
            $this->conn->rollback();
            return false;
        }
    }


    // ==================================================
    // UPDATE (FIX TANPA id_barang)
    // ==================================================
    public function update($id, $d)
    {
        $this->conn->begin_transaction();

        try {
            $id = intval($id);

            // Kembalikan stok lama
            $res = $this->conn->query("
                SELECT id_stok_opname, qty 
                FROM kasir_detail 
                WHERE id_kasir = $id
            ");

            while ($row = $res->fetch_assoc()) {
                $this->conn->query("
                    UPDATE stok_opname SET stok_rak = stok_rak + {$row['qty']}
                    WHERE id_stok_opname = {$row['id_stok_opname']}
                ");
            }

            // UPDATE HEADER
            $stmt = $this->conn->prepare("
                UPDATE kasir 
                SET no_struk=?, waktu=?, id_jenis_pembayaran=?, total=?, bayar=?, kembali=?, id_user=? 
                WHERE id_kasir=?
            ");
            $stmt->bind_param(
                "ssidddii",
                $d['no_struk'],
                $d['waktu'],
                $d['id_jenis_pembayaran'],
                $d['total'],
                $d['bayar'],
                $d['kembali'],
                $d['id_user'],
                $id
            );
            $stmt->execute();

            // Hapus detail lama
            $this->conn->query("DELETE FROM kasir_detail WHERE id_kasir = $id");

            // INSERT DETAIL BARU
            foreach ($d['kasir_detail'] as $item) {

                $stmtDetail = $this->conn->prepare("
                    INSERT INTO kasir_detail(id_kasir, id_stok_opname, qty, subtotal)
                    VALUES (?, ?, ?, ?)
                ");
                $stmtDetail->bind_param(
                    "iiid",
                    $id,
                    $item['id_stok_opname'],
                    $item['qty'],
                    $item['subtotal']
                );
                $stmtDetail->execute();

                // Kurangi stok baru
                $this->conn->query("
                    UPDATE stok_opname SET stok_rak = stok_rak - {$item['qty']}
                    WHERE id_stok_opname = {$item['id_stok_opname']}
                ");
            }

            $this->conn->commit();
            return true;
        } catch (\Exception $e) {
            $this->conn->rollback();
            return false;
        }
    }

    // ==================================================
    // DELETE
    // ==================================================
    public function delete($id)
    {
        $this->conn->begin_transaction();
        try {

            $id = intval($id);

            // Kembalikan stok
            $res = $this->conn->query("
                SELECT id_stok_opname, qty FROM kasir_detail WHERE id_kasir=$id
            ");

            while ($row = $res->fetch_assoc()) {
                $this->conn->query("
                    UPDATE stok_opname SET stok_rak = stok_rak + {$row['qty']}
                    WHERE id_stok_opname = {$row['id_stok_opname']}
                ");
            }

            // Hapus detail
            $this->conn->query("DELETE FROM kasir_detail WHERE id_kasir=$id");

            // Hapus header
            $stmt = $this->conn->prepare("DELETE FROM kasir WHERE id_kasir=?");
            $stmt->bind_param("i", $id);
            $stmt->execute();

            $this->conn->commit();
            return true;
        } catch (\Exception $e) {
            $this->conn->rollback();
            return false;
        }
    }
}
