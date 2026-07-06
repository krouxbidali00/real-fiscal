<?php

namespace App;

use Symfony\Bundle\FrameworkBundle\Kernel\MicroKernelTrait;
use Symfony\Component\HttpKernel\Kernel as BaseKernel;

class Kernel extends BaseKernel
{
    use MicroKernelTrait;

    /**
     * @return list<string> An array of allowed values for APP_ENV
     */
    // @phpstan-ignore method.unused (framework hook: replaces the KernelTrait default, called from KernelTrait::getKernelParameters() to enforce APP_ENV values)
    private function getAllowedEnvs(): array
    {
        return ['prod', 'dev', 'test'];
    }
}
