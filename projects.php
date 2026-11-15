<?php
require __DIR__.'/includes/bootstrap.php';
$pageTitle='Community Projects — Kabulig Portal';
require __DIR__.'/includes/header.php';
$projects=[
 ['title'=>'STCBF on Sweet Potato','category'=>'AGRI-FISHERY','icon'=>'fa-seedling','color'=>'sage','description'=>'A sweet potato project feature in Kabulig’s community project directory. Follow the linked page for the project’s official scope, activities, and updates.','url'=>'https://www.facebook.com/STCBFonSweetPotato','link'=>'Visit the Facebook page'],
 ['title'=>'Isla Let’s Care','category'=>'COMMUNITY PROJECT','icon'=>'fa-hands-holding-circle','color'=>'blue','description'=>'A community project feature shared with Kabulig. Visit the linked page for official background, current activities, and announcements.','url'=>'https://www.facebook.com/islaletscare','link'=>'Visit the Facebook page'],
 ['title'=>'Samar Lagundi (Vitex negundo)','category'=>'AGRI-FISHERY · SAMAR','icon'=>'fa-leaf','color'=>'coral','description'=>'A featured Samar project centered on lagundi (Vitex negundo). Project updates can share local growing activities, participating communities, and seasonal progress as details are confirmed.','url'=>'/contact.php?subject=Samar%20Lagundi%20Project','link'=>'Ask about the project'],
];
?>
<main class="site-page projects-page">
 <section class="site-page-hero"><div class="container"><div class="eyebrow"><span class="eyebrow-dot"></span> ROOTED IN COMMUNITY</div><h1>Projects growing<br><em>good things together.</em></h1><p>Meet the community projects connected with Kabulig’s Agri-Fishery, Tourism, and Education pillars.</p></div></section>
 <section class="section-pad"><div class="container"><div class="row g-4"><?php foreach($projects as $project): ?><div class="col-md-6 col-xl-4"><article class="project-card"><div class="project-art <?= h($project['color']) ?>"><i class="fa-solid <?= h($project['icon']) ?>" aria-hidden="true"></i><span>COMMUNITY PROJECT</span></div><div class="project-copy"><div class="eyebrow"><?= h($project['category']) ?></div><h2><?= h($project['title']) ?></h2><p><?= h($project['description']) ?></p><a class="btn btn-outline-green" href="<?= h($project['url']) ?>" <?= str_starts_with($project['url'],'http')?'target="_blank" rel="noopener noreferrer"':'' ?>><?= h($project['link']) ?> <span>↗</span></a></div></article></div><?php endforeach; ?></div><div class="project-note"><i class="fa-solid fa-circle-info"></i> Project descriptions will be expanded as official details are shared by the project teams.</div></div></section>
</main>
<?php require __DIR__.'/includes/footer.php'; ?>
