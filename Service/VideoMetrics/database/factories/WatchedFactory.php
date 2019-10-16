<?php

/** @var \Illuminate\Database\Eloquent\Factory $factory */

use App\Watched;
use Faker\Generator as Faker;

$factory->define(Watched::class, function (Faker $faker) {
    return [
        'video' => $faker->video,
        'identifier' => $faker->identifier,
        'url' => $faker->url,
        'client' => $faker->client,
        'watched' => $faker->watched,
    ];
});
