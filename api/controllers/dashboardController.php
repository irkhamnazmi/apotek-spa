<?php
require_once __DIR__ . "/../config/Database.php";

class DashboardController
{
    public $model;
    public function __construct()
    {
        $this->model = new Dashboard();
    }



    public function index()
    {
        Response::success($this->model->getAll());
        // Response::success();
    }
}
