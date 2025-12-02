<?php
require_once __DIR__ . "/../models/Dashboard.php";
require_once __DIR__ . "/../helpers/Response.php";
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
