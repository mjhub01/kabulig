<?php
declare(strict_types=1);
if (session_status() !== PHP_SESSION_ACTIVE) session_start();
// Load local development credentials without requiring a Composer dependency.
$localEnvFile = dirname(__DIR__).'/.env';
if (is_file($localEnvFile)) {
    $localEnv = parse_ini_file($localEnvFile, false, INI_SCANNER_RAW) ?: [];
    foreach ($localEnv as $key => $value) {
        if (getenv((string)$key) === false) {
            putenv($key.'='.$value);
            $_ENV[$key] = $value;
        }
    }
}
function h(string $value): string { return htmlspecialchars($value, ENT_QUOTES, 'UTF-8'); }
function money(float $value): string { return $value === 0.0 ? 'Free' : '₱' . number_format($value, 0); }
function database(): ?PDO {
    static $pdo = null;
    static $attempted = false;
    if ($attempted) return $pdo;
    $attempted = true;
    $databaseUrl = getenv('DATABASE_URL');
    $dbUser = getenv('DB_USER') ?: '';
    $dbPassword = getenv('DB_PASSWORD') ?: '';
    if ($databaseUrl) {
        $parts = parse_url($databaseUrl);
        if ($parts === false || !in_array(strtolower((string)($parts['scheme'] ?? '')), ['postgres', 'postgresql'], true) || empty($parts['host'])) {
            throw new RuntimeException('DATABASE_URL must be a valid PostgreSQL connection URL.');
        }
        $databaseName = ltrim((string)($parts['path'] ?? ''), '/');
        if ($databaseName === '') throw new RuntimeException('DATABASE_URL must include a database name.');
        $dsn = sprintf('pgsql:host=%s;port=%s;dbname=%s', $parts['host'], $parts['port'] ?? '5432', $databaseName);
        $query = [];
        parse_str((string)($parts['query'] ?? ''), $query);
        $sslmode = $query['sslmode'] ?? getenv('DB_SSLMODE');
        $dbUser = rawurldecode((string)($parts['user'] ?? $dbUser));
        $dbPassword = rawurldecode((string)($parts['pass'] ?? $dbPassword));
        if ($sslmode !== false && $sslmode !== null && $sslmode !== '') {
            if (!in_array($sslmode, ['disable', 'allow', 'prefer', 'require', 'verify-ca', 'verify-full'], true)) {
                throw new RuntimeException('DATABASE_URL sslmode must be a supported PostgreSQL SSL mode.');
            }
            $dsn .= ';sslmode='.$sslmode;
        }
    } elseif (getenv('DB_HOST') || getenv('DB_NAME')) {
        $dsn = sprintf('pgsql:host=%s;port=%s;dbname=%s', getenv('DB_HOST') ?: '127.0.0.1', getenv('DB_PORT') ?: '5432', getenv('DB_NAME') ?: 'kabulig');
        $sslmode = getenv('DB_SSLMODE');
        if ($sslmode !== false && $sslmode !== '') {
            if (!in_array($sslmode, ['disable', 'allow', 'prefer', 'require', 'verify-ca', 'verify-full'], true)) {
                throw new RuntimeException('DB_SSLMODE must be a supported PostgreSQL SSL mode.');
            }
            $dsn .= ';sslmode='.$sslmode;
        }
    }
    if (!$dsn) return null;
    if (!extension_loaded('pdo_pgsql')) throw new RuntimeException('PHP pdo_pgsql extension is required for PostgreSQL.');
    $pdo = new PDO($dsn, $dbUser, $dbPassword, [
        PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES=>false,
    ]);
    return $pdo;
}

function account_role_catalog(?PDO $pdo = null): array {
    if (!$pdo) return [];
    return $pdo->query("SELECT p.slug AS pillar_slug, p.name AS pillar_name, r.id AS role_id, r.code, r.name AS role_name, r.description, pr.approval_required, pr.pillar_id FROM pillar_roles pr JOIN pillars p ON p.id=pr.pillar_id JOIN roles r ON r.id=pr.role_id WHERE r.is_platform_role=FALSE ORDER BY p.sort_order, r.sort_order")->fetchAll();
}

function user_pillar_roles(PDO $pdo, int $userId): array {
    $query=$pdo->prepare("SELECT p.slug AS pillar_slug, p.name AS pillar_name, r.code, r.name AS role_name, upr.status FROM user_pillar_roles upr JOIN pillars p ON p.id=upr.pillar_id JOIN roles r ON r.id=upr.role_id WHERE upr.user_id=:user_id ORDER BY p.sort_order, r.sort_order");
    $query->execute(['user_id'=>$userId]);
    return $query->fetchAll();
}
function portal_pillars(): array {
    return [
        'Agri-Fishery' => ['slug'=>'agri-fishery','icon'=>'fa-seedling','tone'=>'sage','intro'=>'Shop local harvests, find farm services, and explore agricultural land.'],
        'Tourism' => ['slug'=>'tourism','icon'=>'fa-compass','tone'=>'coral','intro'=>'Discover local places, stays, and community-led experiences.'],
        'Education' => ['slug'=>'education','icon'=>'fa-book-open','tone'=>'blue','intro'=>'Learn practical skills from local instructors.'],
    ];
}

function portal_product_image_url(string $id, string $stored = ''): string {
    if (preg_match('~^(https?://|/uploads/products/[a-zA-Z0-9._-]+$)~', $stored)) return $stored;
    $photos = [
        'farm-box' => 'https://images.unsplash.com/photo-1782973048144-c22e2300e14a?auto=format&fit=crop&w=1200&q=85',
        'coastal-catch' => 'https://images.unsplash.com/photo-1772155729680-13cbc4d5d9d6?auto=format&fit=crop&w=1200&q=85',
        'testfarm-sweetpotato' => 'https://images.unsplash.com/photo-1744659749700-c4213f840355?auto=format&fit=crop&w=1200&q=85',
        'testfarm-3sisters' => 'https://images.unsplash.com/photo-1782973048144-c22e2300e14a?auto=format&fit=crop&w=1200&q=85',
        'testfarm-lagundi' => 'https://images.unsplash.com/photo-1777043075888-4778667a9ac0?auto=format&fit=crop&w=1200&q=85',
    ];
    return $photos[$id] ?? 'https://images.unsplash.com/photo-1782973048144-c22e2300e14a?auto=format&fit=crop&w=1200&q=85';
}

function portal_items(): array {
    $items = [
        ['id'=>'farm-box','pillar'=>'Agri-Fishery','type'=>'Product','title'=>'Seasonal harvest box','description'=>'A colorful bundle of just-picked vegetables from a family farm.','price'=>480,'unit'=>'per box','provider'=>'Bukid Lokal Cooperative','location'=>'Cavite','image'=>'','image_url'=>portal_product_image_url('farm-box'),'tag'=>'Harvesting soon'],
        ['id'=>'coastal-catch','pillar'=>'Agri-Fishery','type'=>'Product','title'=>'Coastal catch bundle','description'=>'A responsibly sourced mix of the day’s local catch, packed for home.','price'=>650,'unit'=>'per bundle','provider'=>'Bayanihan Fishers','location'=>'Batangas','image'=>'','image_url'=>portal_product_image_url('coastal-catch'),'tag'=>'From local waters'],
        ['id'=>'farm-tour','pillar'=>'Tourism','type'=>'Experience','title'=>'A day on the farm','description'=>'Walk the fields, meet the growers, and share a farm-to-table lunch.','price'=>1200,'unit'=>'per guest','provider'=>'Bukid Lokal Cooperative','location'=>'Cavite','image'=>'🌱','tag'=>'Small group'],
        ['id'=>'coast-trail','pillar'=>'Tourism','type'=>'Experience','title'=>'Coast and community trail','description'=>'Explore a quiet shoreline with a local guide and fisherfolk host.','price'=>950,'unit'=>'per guest','provider'=>'Bayanihan Fishers','location'=>'Batangas','image'=>'🌊','tag'=>'Local guide'],
        ['id'=>'grow-food','pillar'=>'Education','type'=>'Course','title'=>'Grow food in small spaces','description'=>'A practical, self-paced introduction to growing herbs and vegetables.','price'=>350,'unit'=>'one-time','provider'=>'Kabulig Learning Circle','location'=>'Online','image'=>'🪴','tag'=>'Self-paced'],
        ['id'=>'coastal-livelihood','pillar'=>'Education','type'=>'Course','title'=>'Sustainable coastal livelihoods','description'=>'Learn the foundations of responsible fisheries and community enterprise.','price'=>0,'unit'=>'free','provider'=>'Kabulig Learning Circle','location'=>'Online','image'=>'🐚','tag'=>'Free course'],
    ];
    if (getenv('DATABASE_URL') || getenv('DB_HOST')) {
        try {
            $pdo = database();
            $rows = $pdo->query("SELECT l.id, l.pillar, l.item_type, l.title, l.description, l.price_minor, l.price_unit, l.provider_name, l.location, p.location AS seller_location, l.emoji, l.badge FROM listings l LEFT JOIN providers p ON p.id=l.provider_id WHERE l.status = 'published' ORDER BY l.featured DESC, l.created_at DESC")->fetchAll(PDO::FETCH_ASSOC);
            if ($rows) $items = array_map(static fn($r)=>['id'=>(string)$r['id'],'pillar'=>$r['pillar'],'type'=>$r['item_type'],'title'=>$r['title'],'description'=>$r['description'],'price'=>((int)$r['price_minor'])/100,'unit'=>$r['price_unit'],'provider'=>$r['provider_name'],'location'=>($r['pillar']==='Agri-Fishery'&&$r['item_type']==='Product'&&$r['seller_location'])?$r['seller_location']:$r['location'],'image'=>$r['emoji'] ?: '','image_url'=>$r['item_type']==='Product'?portal_product_image_url((string)$r['id'],(string)$r['emoji']):null,'tag'=>$r['badge'] ?: 'Community pick'], $rows);
        } catch (Throwable $e) { /* Demo catalog remains available if PostgreSQL is unavailable. */ }
    }
    return $items;
}

