<?php
declare(strict_types = 1);

/*
 * This file is part of the package typo3/cms-digital-asset-management.
 *
 * For the full copyright and license information, please read the
 * LICENSE file that was distributed with this source code.
 */

namespace TYPO3\CMS\DigitalAssetManagement\Http;

use TYPO3\CMS\Core\Http\JsonResponse;

class FileExistsResponse extends JsonResponse
{
    public const FILE_DOES_NOT_EXIST = 0;
    public const PARENT_FOLDER_DOES_NOT_EXIST = 1;

    /**
     * @param int $state
     */
    public function __construct(int $state)
    {
        parent::__construct(['state' => $state]);
    }
}
