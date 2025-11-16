<?php

class Response
{
    public static function success($data = [], $message = "Success", $code = 200)
    {
        http_response_code($code);
        echo json_encode([
            "meta" => [
                "code" => $code,
                "status" => "success",
                "message" => $message
            ],
            "data" => $data ?: new stdClass() // ensures {} when empty
        ], JSON_PRETTY_PRINT);
        exit;
    }

    public static function error($message = "Error", $code = 400)
    {
        http_response_code($code);
        echo json_encode([
            "meta" => [
                "code" => $code,
                "status" => "error",
                "message" => $message
            ],
            "data" => new stdClass()
        ], JSON_PRETTY_PRINT);
        exit;
    }
}
