<?php
require_once __DIR__ . "/../models/StokOpname.php";
require_once __DIR__ . "/../helpers/Response.php";

class StokOpnameController
{
    private $model;
    private $conn;


    public function __construct()
    {
        $this->model = new StokOpname();
        $this->conn = Database::getConnection();
    }

    public function index()
    {
        Response::success($this->model->getAll());
    }
    public function show($id)
    {
        $data = $this->model->getById($id);
        $data ? Response::success($data) : Response::error("Data tidak ditemukan");
    }

    public function showByDateRange($startDate, $endDate)
    {
        // Pastikan tanggal yang diterima valid
        $startDate = $this->conn->real_escape_string($startDate);
        $endDate = $this->conn->real_escape_string($endDate);

        // Ambil data berdasarkan rentang tanggal
        $data = $this->model->getByDateRange($startDate, $endDate);

        // Cek apakah data ditemukan
        if ($data) {
            // Jika data ditemukan, kirim response sukses
            Response::success($data);
        } else {
            // Jika data tidak ditemukan, kirim response error
            Response::error("Data tidak ditemukan untuk rentang tanggal tersebut.");
        }
    }

    public function store($input)
    {
        $this->model->create($input) ? Response::success([], "Data berhasil ditambahkan") : Response::error("Gagal menambahkan data");
    }
    public function update($id, $input)
    {
        $this->model->update($id, $input) ? Response::success([], "Data berhasil diupdate") : Response::error("Gagal update data");
    }
    public function destroy($id)
    {
        $this->model->delete($id) ? Response::success([], "Data berhasil dihapus") : Response::error("Gagal hapus data");
    }
}
