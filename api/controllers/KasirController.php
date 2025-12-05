<?php
require_once __DIR__ . "/../models/Kasir.php";
require_once __DIR__ . "/../helpers/Response.php";

class KasirController
{
    private $model;
    public function __construct()
    {
        $this->model = new Kasir();
    }

    public function index()
    {
        Response::success($this->model->getAll());
    }
    public function show($id)
    {
        $kasir = $this->model->getHeaderById($id);
        $detail = $this->model->getDetailById($id);

        if (!$kasir) {
            return Response::error("Kasir tidak ditemukan");
        }

        return Response::success([
            "kasir" => $kasir,
            "order" => $detail
        ]);
    }

    public function showByDateRange()
    {
        $tgl_awal = $_GET['tgl_awal'] ?? null;
        $tgl_akhir = $_GET['tgl_akhir'] ?? null;

        if (!$tgl_awal || !$tgl_akhir) {
            return Response::error("Tanggal awal dan akhir wajib diisi");
        }

        $kasirList = $this->model->getKasirByDateRange($tgl_awal, $tgl_akhir);

        if (!$kasirList || count($kasirList) === 0) {
            return Response::error("Tidak ada data kasir pada tanggal tersebut");
        }

        // Ambil detail setiap kasir
        $result = [];

        foreach ($kasirList as $kasir) {
            $detail = $this->model->getDetailById($kasir["id_kasir"]);

            $result[] = [
                "kasir" => $kasir,
                "order" => $detail
            ];
        }

        return Response::success($result);
    }


    public function store($input)
    {
        $this->model->create($input) ? Response::success([], "Kasir berhasil ditambahkan") : Response::error("Gagal menambahkan kasir");
    }
    public function update($id, $input)
    {
        $this->model->update($id, $input) ? Response::success([], "Kasir berhasil diupdate") : Response::error("Gagal update kasir");
    }
    public function destroy($id)
    {
        $this->model->delete($id) ? Response::success([], "Kasir berhasil dihapus") : Response::error("Gagal hapus kasir");
    }
}
