<?php
declare(strict_types = 1);
namespace TYPO3\CMS\DigitalAssetManagement\Http;

/*
 * This file is part of the package lns/digital-asset-management.
 *
 * For the full copyright and license information, please read the
 * LICENSE file that was distributed with this source code.
 */

use TYPO3\CMS\Core\Http\JsonResponse;
use TYPO3\CMS\DigitalAssetManagement\Entity\FileMount;
use TYPO3\CMS\DigitalAssetManagement\Entity\Storage;

/**
 * A 200 response object returned by controller
 * action getStoragesAndMountsAction(). Contains
 * an array of Storage or FileMount objects.
 *
 * @see Storage
 * @see FileMount
 */
class StoragesAndMountsResponse extends JsonResponse
{
    /**
     * @param Storage[]|FileMount[]
     */
    public function __construct(array $entities)
    {
        parent::__construct($entities, 200);
    }
}
