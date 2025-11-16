<?php
ob_start(); // 
// Jika OPTIONS (preflight request)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = explode('/', trim($path, '/'));
$table = end($uri); // ambil elemen terakhir dari URL

function parseInput()
{
    return json_decode(file_get_contents("php://input"), true);
}

// ====================== SATUAN ======================
if ($table === 'satuan') {
    require_once __DIR__ . "/../controllers/SatuanController.php";
    $c = new SatuanController();
    if ($method === 'GET') isset($_GET['id_satuan']) ? $c->show($_GET['id_satuan']) : $c->index();
    elseif ($method === 'POST') $c->store(parseInput());
    elseif ($method === 'PUT') $c->update(parseInput()['id_satuan'], parseInput());
    elseif ($method === 'DELETE') {
        parse_str(file_get_contents("php://input"), $input);
        $c->destroy($input['id_satuan']);
    }
}

// ====================== MASTER_BARANG ======================
elseif ($table === 'master_barang') {
    require_once __DIR__ . "/../controllers/MasterBarangController.php";
    $c = new MasterBarangController();
    if ($method === 'GET') isset($_GET['id_barang']) ? $c->show($_GET['id_barang']) : $c->index();
    elseif ($method === 'POST') $c->store(parseInput());
    elseif ($method === 'PUT') $c->update(parseInput()['id_barang'], parseInput());
    elseif ($method === 'DELETE') {
        parse_str(file_get_contents("php://input"), $input);
        $c->destroy($input['id_barang']);
    }
}

// ====================== USERS ======================
elseif ($table === 'users') {
    require_once __DIR__ . "/../controllers/UsersController.php";
    $c = new UsersController();
    if ($method === 'GET') isset($_GET['id_user']) ? $c->show($_GET['id_user']) : $c->index();
    elseif ($method === 'POST') $c->store(parseInput());
    elseif ($method === 'PUT') $c->update(parseInput()['id_user'], parseInput());
    elseif ($method === 'DELETE') {
        parse_str(file_get_contents("php://input"), $input);
        $c->destroy($input['id_user']);
    }
}

// ====================== JENIS_PEMBAYARAN ======================
elseif ($table === 'jenis_pembayaran') {
    require_once __DIR__ . "/../controllers/JenisPembayaranController.php";
    $c = new JenisPembayaranController();
    if ($method === 'GET') isset($_GET['id_jenis_pembayaran']) ? $c->show($_GET['id_jenis_pembayaran']) : $c->index();
    elseif ($method === 'POST') $c->store(parseInput());
    elseif ($method === 'PUT') $c->update(parseInput()['id_jenis_pembayaran'], parseInput());
    elseif ($method === 'DELETE') {
        parse_str(file_get_contents("php://input"), $input);
        $c->destroy($input['id_jenis_pembayaran']);
    }
}

// ====================== LOKASI_PENYIMPANAN ======================
elseif ($table === 'lokasi_penyimpanan') {
    require_once __DIR__ . "/../controllers/LokasiPenyimpananController.php";
    $c = new LokasiPenyimpananController();
    if ($method === 'GET') isset($_GET['id_lokasi_penyimpanan']) ? $c->show($_GET['id_lokasi_penyimpanan']) : $c->index();
    elseif ($method === 'POST') $c->store(parseInput());
    elseif ($method === 'PUT') $c->update(parseInput()['id_lokasi_penyimpanan'], parseInput());
    elseif ($method === 'DELETE') {
        parse_str(file_get_contents("php://input"), $input);
        $c->destroy($input['id_lokasi_penyimpanan']);
    }
}

// ====================== STOK_OPNAME ======================
elseif ($table === 'stok_opname') {
    require_once __DIR__ . "/../controllers/StokOpnameController.php";
    $c = new StokOpnameController();
    if ($method === 'GET') isset($_GET['id_stok_opname']) ? $c->show($_GET['id_stok_opname']) : $c->index();
    elseif ($method === 'POST') $c->store(parseInput());
    elseif ($method === 'PUT') $c->update(parseInput()['id_stok_opname'], parseInput());
    elseif ($method === 'DELETE') {
        parse_str(file_get_contents("php://input"), $input);
        $c->destroy($input['id_stok_opname']);
    }
}

// ====================== ORDER ======================
elseif ($table === 'order') {
    require_once __DIR__ . "/../controllers/OrderController.php";
    $c = new OrderController();
    if ($method === 'GET') isset($_GET['id_order']) ? $c->show($_GET['id_order']) : $c->index();
    elseif ($method === 'POST') $c->store(parseInput());
    elseif ($method === 'PUT') $c->update(parseInput()['id_order'], parseInput());
    elseif ($method === 'DELETE') {
        parse_str(file_get_contents("php://input"), $input);
        $c->destroy($input['id_order']);
    }
}

// ====================== KASIR_DETAIL ======================
elseif ($table === 'kasir_detail') {
    require_once __DIR__ . "/../controllers/KasirDetailController.php";
    $c = new KasirDetailController();
    if ($method === 'GET') isset($_GET['id_kasir_detail']) ? $c->show($_GET['id_kasir_detail']) : $c->index();
    elseif ($method === 'POST') $c->store(parseInput());
    elseif ($method === 'PUT') $c->update(parseInput()['id_kasir_detail'], parseInput());
    elseif ($method === 'DELETE') {
        parse_str(file_get_contents("php://input"), $input);
        $c->destroy($input['id_kasir_detail']);
    }
}

// ====================== KASIR ======================
elseif ($table === 'kasir') {
    require_once __DIR__ . "/../controllers/KasirController.php";
    $c = new KasirController();
    if ($method === 'GET') isset($_GET['id_kasir']) ? $c->show($_GET['id_kasir']) : $c->index();
    elseif ($method === 'POST') $c->store(parseInput());
    elseif ($method === 'PUT') $c->update(parseInput()['id_kasir'], parseInput());
    elseif ($method === 'DELETE') {
        parse_str(file_get_contents("php://input"), $input);
        $c->destroy($input['id_kasir']);
    }
}

// ====================== DEFAULT ======================
else {
    http_response_code(404);
    echo json_encode(["status" => "error", "message" => "Endpoint tidak ditemukan"]);
}
