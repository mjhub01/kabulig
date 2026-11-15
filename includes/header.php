<?php
$pageTitle = $pageTitle ?? 'Kabulig Portal — Grow together';
$currentPillar = $currentPillar ?? '';
$basketCount = array_sum($_SESSION['basket'] ?? []);
$primaryNav = [
  'agri-fishery'=>['/agri-fishery/market.php','fa-seedling'],
  'tourism'=>['/tourism/experiences.php','fa-compass'],
  'education'=>['/education/courses.php','fa-book-open'],
];
$generalNav = [
  ['Projects','/projects.php','fa-diagram-project'],
  ['About','/about.php','fa-circle-info'],
  ['Linkages','/linkages.php','fa-handshake'],
  ['Support','/support.php','fa-life-ring'],
  ['Contact','/contact.php','fa-envelope'],
];
$activePage=basename((string)($_SERVER['SCRIPT_NAME']??''));
$signedIn=!empty($_SESSION['account']['id']);
$accountName=trim((string)($_SESSION['account']['name']??''));
$accountFirstName=explode(' ',preg_replace('/\s+/',' ',$accountName))[0]??'';
$accountMenuLabel=$signedIn?'Account menu for '.$accountName:'Sign in or create an account';
$navIsAdmin=false;
if($signedIn){
  try{$navDb=database();if($navDb){$navRole=$navDb->prepare("SELECT 1 FROM user_roles ur JOIN roles r ON r.id=ur.role_id WHERE ur.user_id=:uid AND r.code='admin'");$navRole->execute(['uid'=>(int)$_SESSION['account']['id']]);$navIsAdmin=(bool)$navRole->fetchColumn();}}catch(Throwable $ignored){$navIsAdmin=false;}
}
$_SESSION['account_csrf']??=bin2hex(random_bytes(32));
$secondaryIconMap = [
  'agri-fishery'=>['market.php'=>'fa-basket-shopping','services.php'=>'fa-tractor','work-earnings.php'=>'fa-wallet','land-experiences.php'=>'fa-mountain-sun'],
  'tourism'=>['experiences.php'=>'fa-map-location-dot','sightseeing.php'=>'fa-binoculars','farm-stays.php'=>'fa-house','land-listings.php'=>'fa-landmark'],
  'education'=>['courses.php'=>'fa-graduation-cap','my-learning.php'=>'fa-book-open-reader','learning-guide.php'=>'fa-circle-question'],
];
?>
<!doctype html>
<html lang="en"><head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Discover local harvests, agricultural lands, community experiences, and practical courses with Kabulig Portal.">
  <title><?= h($pageTitle) ?></title>
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@500;600;700;800&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"><link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" rel="stylesheet"><link href="/assets/app.css" rel="stylesheet">
</head><body>
<nav class="navbar navbar-expand-lg bg-white sticky-top border-bottom"><div class="container py-1">
  <a class="navbar-brand d-flex align-items-center" href="/"><img class="brand-logo" src="/kabulig.png" alt="Kabulig Portal">
  <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav" aria-label="Toggle navigation"><span class="navbar-toggler-icon"></span></button>
  <div class="collapse navbar-collapse" id="mainNav"><ul class="navbar-nav mx-auto gap-lg-3">
    <?php foreach (portal_pillars() as $name=>$pillar): $nav=$primaryNav[$pillar['slug']]; ?><li><a class="nav-link pillar-nav-link pillar-nav-<?= h($pillar['slug']) ?> <?= $currentPillar===$name?'active':'' ?>" href="<?= h($nav[0]) ?>"><i class="fa-solid <?= h($nav[1]) ?> nav-item-icon" aria-hidden="true"></i><span><?= h($name) ?></span></a></li><?php endforeach; ?>
    <li class="nav-group-separator" aria-hidden="true"></li>
    <?php foreach($generalNav as [$label,$url,$icon]): ?><li><a class="nav-link pillar-nav-link <?= $activePage===basename($url)?'active':'' ?>" href="<?= h($url) ?>"><i class="fa-solid <?= h($icon) ?> nav-item-icon" aria-hidden="true"></i><span><?= h($label) ?></span></a></li><?php endforeach; ?>
  </ul><div class="d-flex align-items-center gap-2 navbar-account-actions"><a class="btn btn-darkgreen navbar-basket-btn" href="/basket.php" aria-label="Basket, <?= (int)$basketCount ?> items" title="Basket"><i class="fa-solid fa-basket-shopping" aria-hidden="true"></i><span class="basket-count"><?= (int)$basketCount ?></span></a><div class="dropdown account-nav-item"><button class="account-icon-button" type="button" data-bs-display="static" data-bs-toggle="dropdown" aria-expanded="false" aria-label="<?= h($accountMenuLabel) ?>" title="<?= h($accountMenuLabel) ?>"><span class="account-trigger-icon"><i class="fa-solid fa-user" aria-hidden="true"></i><?php if($signedIn): ?><span class="account-signed-in-dot" aria-label="Signed in"></span><?php endif; ?></span><?php if($signedIn): ?><span class="account-trigger-name"><?= h($accountFirstName) ?></span><?php endif; ?></button><div class="dropdown-menu dropdown-menu-end account-dropdown-menu"><?php if($signedIn): ?><div class="account-dropdown-heading"><strong><?= h($_SESSION['account']['name']??'Kabulig member') ?></strong><small><?= h($_SESSION['account']['email']??'') ?></small></div><a class="dropdown-item" href="/account.php#profile"><i class="fa-regular fa-id-card"></i> My profile</a><a class="dropdown-item" href="/account.php#roles"><i class="fa-solid fa-layer-group"></i> Pillar roles</a><?php if($navIsAdmin): ?><a class="dropdown-item" href="/admin.php"><i class="fa-solid fa-gauge-high"></i> Admin dashboard</a><?php endif; ?><a class="dropdown-item" href="/support.php"><i class="fa-regular fa-circle-question"></i> Help & support</a><div class="dropdown-divider"></div><form method="post" action="/account.php" class="account-dropdown-logout"><input type="hidden" name="_token" value="<?= h($_SESSION['account_csrf']) ?>"><input type="hidden" name="action" value="logout"><button class="dropdown-item" type="submit"><i class="fa-solid fa-arrow-right-from-bracket"></i> Sign out</button></form><?php else: ?><a class="dropdown-item" href="/account.php#login"><i class="fa-solid fa-right-to-bracket"></i> Sign in</a><a class="dropdown-item" href="/account.php#register"><i class="fa-solid fa-user-plus"></i> Create account</a><?php endif; ?></div></div></div></div>
</div></nav>
<?php if (!empty($secondaryLinks)): ?>
<div class="secondary-nav-wrap <?= h($secondaryTone ?? '') ?>-secondary"><div class="container"><nav class="agri-subnav" aria-label="<?= h($currentPillar) ?> pages"><?php foreach($secondaryLinks as [$label,$file,$active]): ?><a class="<?= $active?'active':'' ?>" href="/<?= h($secondaryBase) ?>/<?= h($file) ?>"><i class="fa-solid <?= h($secondaryIconMap[$secondaryBase][$file] ?? 'fa-circle') ?> nav-item-icon" aria-hidden="true"></i><span><?= h($label) ?></span></a><?php endforeach; ?></nav></div></div>
<?php endif; ?>

