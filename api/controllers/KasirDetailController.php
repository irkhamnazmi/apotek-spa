<?php
require_once __DIR__ . "/../models/KasirDetail.php";
require_once __DIR__ . "/../helpers/Response.php";

class KasirDetailController
{
    private $model;
    public function __construct()
    {
        $this->model = new KasirDetail();
    }

    public function index()
    {
        Response::success($this->model->getAll());
    }
    public function show($id)
    {
        $data = $this->model->getById($id);
        $data ? Response::success($data) : Response::error("Detail kasir tidak ditemukan");
    }
    public function store($input)
    {
        $this->model->create($input) ? Response::success([], "Detail kasir berhasil ditambahkan") : Response::error("Gagal menambahkan detail kasir");
    }
    public function update($id, $input)
    {
        $this->model->update($id, $input) ? Response::success([], "Detail kasir berhasil diupdate") : Response::error("Gagal update detail kasir");
    }
    public function destroy($id)
    {
        $this->model->delete($id) ? Response::success([], "Detail kasir berhasil dihapus") : Response::error("Gagal hapus detail kasir");
    }
}
