<?php
class Database
{
    private static $conn;

    public static function getConnection()
    {
        if (!self::$conn) {
            $host = "mariadb";
            $db_name = "palmirafit";
            $username = "root";
            $password = "rootpass";

            self::$conn = new mysqli($host, $username, $password, $db_name);
            if (self::$conn->connect_error) {
                die(json_encode(["status" => "error", "message" => "Connection failed: " . $conn->connect_error]));
            }
            self::$conn->set_charset("utf8");
        }
        return self::$conn;
    }
}
