<?php
require_once __DIR__ . "/../models/Order.php";
require_once __DIR__ . "/../helpers/Response.php";

class OrderController
{
    private $model;
    public function __construct()
    {
        $this->model = new OrderModel();
    }

    public function index()
    {
        Response::success($this->model->getAll());
    }
    public function show($id)
    {
        $data = $this->model->getById($id);
        $data ? Response::success($data) : Response::error("Order tidak ditemukan");
    }
    public function store($input)
    {
        $this->model->create($input) ? Response::success([], "Order berhasil ditambahkan") : Response::error("Gagal menambahkan order");
    }
    public function update($id, $input)
    {
        $this->model->update($id, $input) ? Response::success([], "Order berhasil diupdate") : Response::error("Gagal update order");
    }
    public function destroy($id)
    {
        $this->model->delete($id) ? Response::success([], "Order berhasil dihapus") : Response::error("Gagal hapus order");
    }
}
