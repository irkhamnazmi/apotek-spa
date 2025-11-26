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
    // GENERATE NO STRUK → format: 0001/11/25
    // ==================================================
    public function generateNoStruk()
    {
        $bln = date("m");
        $thn = date("y"); // 2 digit tahun

        // Ambil nomor terakhir sesuai bulan & tahun
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
    // GET ALL KASIR (TABEL UTAMA)
    // ==================================================
    public function getAll()
    {
        $sql = "SELECT a.*, us.*,             
        FROM kasir a INNER JOIN users us ON us.id_user = a.id_user INNER JOIN stok_opname so ON so.id_stok_opname = a.id_user";


        $data = [];
        $res = $this->conn->query($sql);

        while ($row = $res->fetch_assoc()) {
            $data[] = $row;
        }

        return $data;
    }


    // ==================================================
    // GET DETAIL BY ID
    // ==================================================
    public function getById($id)
    {
        $id = intval($id);

        $kasir = $this->conn->query("
            SELECT * FROM kasir WHERE id_kasir=$id
        ")->fetch_assoc();

        if (!$kasir) return null;

        $detail = [];
        $res = $this->conn->query("
            SELECT kd.*, b.nama_barang 
            FROM kasir_detail kd
            LEFT JOIN stok_opname b ON kd.id_barang = b.id_barang
            WHERE kd.id_kasir=$id
        ");
        while ($row = $res->fetch_assoc()) $detail[] = $row;

        return [
            "kasir" => $kasir,
            "order" => $detail
        ];
    }

    // ==================================================
    // CREATE KASIR
    // ==================================================
    public function create($d)
    {
        $this->conn->begin_transaction();
        try {

            if (empty($d['no_struk'])) {
                $d['no_struk'] = $this->generateNoStruk();
            }

            $stmt = $this->conn->prepare("
                INSERT INTO kasir(no_struk, waktu, id_jenis_pembayaran, total, bayar, kembali, id_user)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->bind_param(
                "ssiddii",
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

            // INSERT DETAIL & KURANGI STOK
            foreach ($d['kasir_detail'] as $item) {

                $stmtDetail = $this->conn->prepare("
                    INSERT INTO kasir_detail(id_kasir, id_barang, qty, subtotal)
                    VALUES (?, ?, ?, ?)
                ");
                $stmtDetail->bind_param(
                    "iiid",
                    $id_kasir,
                    $item['id_barang'],
                    $item['qty'],
                    $item['subtotal']
                );
                $stmtDetail->execute();

                // Kurangi stok
                $stmtStok = $this->conn->prepare("
                    UPDATE stok_opname SET stok_rak = stok_rak - ? 
                    WHERE id_barang = ?
                ");
                $stmtStok->bind_param("ii", $item['qty'], $item['id_barang']);
                $stmtStok->execute();
            }

            $this->conn->commit();
            return true;
        } catch (\Exception $e) {
            $this->conn->rollback();
            return false;
        }
    }

    // ==================================================
    // UPDATE KASIR
    // ==================================================
    public function update($id, $d)
    {
        $this->conn->begin_transaction();
        try {

            $id = intval($id);

            // ROLLBACK STOK LAMA
            $res = $this->conn->query("
                SELECT id_barang, qty FROM kasir_detail WHERE id_kasir=$id
            ");

            while ($row = $res->fetch_assoc()) {
                $stmtRollback = $this->conn->prepare("
                    UPDATE stok_opname SET stok_rak = stok_rak + ? 
                    WHERE id_barang = ?
                ");
                $stmtRollback->bind_param("ii", $row['qty'], $row['id_barang']);
                $stmtRollback->execute();
            }

            // UPDATE KASIR
            $stmt = $this->conn->prepare("
                UPDATE kasir 
                SET no_struk=?, waktu=?, id_jenis_pembayaran=?, total=?, bayar=?, kembali=?, id_user=? 
                WHERE id_kasir=?
            ");
            $stmt->bind_param(
                "ssiddiii",
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

            // HAPUS DETAIL LAMA
            $this->conn->query("DELETE FROM kasir_detail WHERE id_kasir=$id");

            // INSERT DETAIL BARU & KURANGI STOK
            foreach ($d['kasir_detail'] as $item) {

                $stmtDetail = $this->conn->prepare("
                    INSERT INTO kasir_detail(id_kasir, id_barang, qty, subtotal)
                    VALUES (?, ?, ?, ?)
                ");
                $stmtDetail->bind_param(
                    "iiid",
                    $id,
                    $item['id_barang'],
                    $item['qty'],
                    $item['subtotal']
                );
                $stmtDetail->execute();

                // Kurangi stok baru
                $stmtStok = $this->conn->prepare("
                    UPDATE stok_opname SET stok_rak = stok_rak - ? 
                    WHERE id_barang = ?
                ");
                $stmtStok->bind_param("ii", $item['qty'], $item['id_barang']);
                $stmtStok->execute();
            }

            $this->conn->commit();
            return true;
        } catch (\Exception $e) {
            $this->conn->rollback();
            return false;
        }
    }

    // ==================================================
    // DELETE KASIR
    // ==================================================
    public function delete($id)
    {
        $this->conn->begin_transaction();
        try {

            $id = intval($id);

            // Kembalikan stok
            $res = $this->conn->query("
                SELECT id_barang, qty FROM kasir_detail WHERE id_kasir=$id
            ");

            while ($row = $res->fetch_assoc()) {
                $stmtRollback = $this->conn->prepare("
                    UPDATE stok_opname SET stok_rak = stok_rak + ? 
                    WHERE id_barang = ?
                ");
                $stmtRollback->bind_param("ii", $row['qty'], $row['id_barang']);
                $stmtRollback->execute();
            }

            // Hapus detail
            $this->conn->query("DELETE FROM kasir_detail WHERE id_kasir=$id");

            // Hapus kasir
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
