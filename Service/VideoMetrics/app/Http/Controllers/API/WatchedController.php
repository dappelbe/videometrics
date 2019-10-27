<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Watched;
use Illuminate\Http\Request;

class WatchedController extends Controller
{
    public function index() {
        return response()->json('All running ok',200);
    }
    
    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $row = new Watched();
        $row->video = $request['video'];
        $row->identifier = $request['identifier'];
        $row->url = $request['url'];
        $row->client = $request['client'];
        $row->watched = $request['watched'];
        $row->saveOrFail();
    }
}
