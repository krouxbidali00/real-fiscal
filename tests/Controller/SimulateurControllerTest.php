<?php

declare(strict_types=1);

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class SimulateurControllerTest extends WebTestCase
{
    public function testHomePageRendersAlpineApp(): void
    {
        $client = self::createClient();
        $client->request('GET', '/');

        self::assertResponseIsSuccessful();
        self::assertSelectorExists('[x-data="fraisReels"]');
    }
}
