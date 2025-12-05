<?php
require_once __DIR__ . "/../config/Database.php";

class StokOpname
{
    private $conn;
    public function __construct()
    {
        $this->conn = Database::getConnection();
    }

    public function getAll()
    {
        $data = [];
        $res = $this->conn->query("SELECT so.*, mb.*, lp.*, sa.* FROM stok_opname so inner join master_barang mb on so.id_barang=mb.id_barang inner join lokasi_penyimpanan lp on so.id_lokasi_penyimpanan=lp.id_lokasi_penyimpanan inner join satuan sa on sa.id_satuan=mb.id_satuan");
        while ($row = $res->fetch_assoc()) $data[] = $row;
        return $data;
    }
    public function getById($id)
    {
        $id = intval($id);
        $res = $this->conn->query("SELECT so.*, mb.*, lp.*, sa.* FROM stok_opname so inner join master_barang mb on so.id_barang=mb.id_barang inner join lokasi_penyimpanan lp on so.id_lokasi_penyimpanan=lp.id_lokasi_penyimpanan inner join satuan sa on sa.id_satuan=mb.id_satuan WHERE so.id_stok_opname=$id");
        return $res->fetch_assoc();
    }

    public function getByDateRange($startDate, $endDate)
    {
        // Pastikan format tanggal sesuai dengan format MySQL (YYYY-MM-DD)
        $startDate = $this->conn->real_escape_string($startDate);
        $endDate = $this->conn->real_escape_string($endDate);

        // Query untuk mendapatkan data berdasarkan rentang tanggal
        $query = "
        SELECT so.*, mb.*, lp.* , sa.*
        FROM stok_opname so
        INNER JOIN master_barang mb ON so.id_barang = mb.id_barang
        INNER JOIN lokasi_penyimpanan lp ON so.id_lokasi_penyimpanan = lp.id_lokasi_penyimpanan
        INNER JOIN satuan sa ON so.id_satuan = sa.id_satuan

        WHERE so.tanggal_opname BETWEEN '$startDate' AND '$endDate'
    ";

        $res = $this->conn->query($query);

        // Mengembalikan semua data yang ditemukan
        $data = [];
        while ($row = $res->fetch_assoc()) {
            $data[] = $row;
        }

        return $data;
    }

    public function create($d)
    {
        // Insert stok_opname
        $stmt = $this->conn->prepare("INSERT INTO stok_opname (id_barang, id_lokasi_penyimpanan, stok_rak, kapasitas_rak) VALUES (?, ?, ?, ?)");
        $stmt->bind_param(
            "iiii",
            $d['id_barang'],
            $d['id_lokasi_penyimpanan'],
            $d['stok_rak'],
            $d['kapasitas_rak']
        );

        if (!$stmt->execute()) {
            return false;
        }

        // Kurangi stok_barang
        $update = $this->conn->prepare("UPDATE master_barang SET stok_barang = CASE WHEN stok_barang - ? < 0 THEN 0 ELSE stok_barang - ? END WHERE id_barang = ? ");
        $update->bind_param(
            "iii",
            $d['stok_rak'],
            $d['stok_rak'],
            $d['id_barang']
        );

        return $update->execute();
    }
    public function update($id, $d)
    {
        // 1. Ambil stok lama dan id_barang lama
        $q = $this->conn->prepare("SELECT stok_rak, id_barang FROM stok_opname WHERE id_stok_opname = ?");
        $q->bind_param("i", $id);
        $q->execute();
        $result = $q->get_result()->fetch_assoc();

        if (!$result) return false;

        $stok_lama = (int)$result['stok_rak'];
        $id_barang_lama = (int)$result['id_barang'];

        // 2. Kembalikan stok_barang lama
        $restore = $this->conn->prepare("UPDATE master_barang SET stok_barang = stok_barang + ? WHERE id_barang = ?");
        $restore->bind_param("ii", $stok_lama, $id_barang_lama);
        $restore->execute();

        // 3. Update stok_opname
        $stmt = $this->conn->prepare("UPDATE stok_opname SET id_barang=?, id_lokasi_penyimpanan=?, stok_rak=?, kapasitas_rak=? WHERE id_stok_opname=?");
        $stmt->bind_param(
            "iiiii",
            $d['id_barang'],
            $d['id_lokasi_penyimpanan'],
            $d['stok_rak'],
            $d['kapasitas_rak'],
            $id
        );

        if (!$stmt->execute()) {
            return false;
        }

        // 4. Kurangi stok_barang baru
        $updateStock = $this->conn->prepare("UPDATE master_barang SET stok_barang = CASE WHEN stok_barang - ? < 0 THEN 0 ELSE stok_barang - ? END WHERE id_barang = ?");
        $updateStock->bind_param(
            "iii",
            $d['stok_rak'],
            $d['stok_rak'],
            $d['id_barang']
        );

        return $updateStock->execute();
    }

    public function delete($id)
    {
        $stmt = $this->conn->prepare("DELETE FROM stok_opname WHERE id_stok_opname=?");
        $stmt->bind_param("i", $id);
        return $stmt->execute();
    }
}
