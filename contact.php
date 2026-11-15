<?php
require __DIR__.'/includes/bootstrap.php';
$_SESSION['flash']??=null;
$notice=$_SESSION['flash'];$_SESSION['flash']=null;
$subject=trim((string)($_GET['subject']??''));
if($_SERVER['REQUEST_METHOD']==='POST'&&($_POST['action']??'')==='contact'){
 $name=trim((string)($_POST['name']??''));$email=trim((string)($_POST['email']??''));$topic=trim((string)($_POST['subject']??''));$message=trim((string)($_POST['message']??''));
 if($name!==''&&filter_var($email,FILTER_VALIDATE_EMAIL)&&$topic!==''&&$message!==''){$_SESSION['contact_messages'][]=['name'=>$name,'email'=>$email,'subject'=>$topic,'message'=>$message,'submitted'=>date('M j, Y')];$_SESSION['flash']='Thanks for reaching out. Your message is saved in this demo session.';}else{$_SESSION['flash']='Please enter your name, a valid email, a subject, and a message.';}
 header('Location: /contact.php');exit;
}
$pageTitle='Contact Kabulig — Get in Touch';require __DIR__.'/includes/header.php';
?>
<main class="site-page contact-page"><section class="site-page-hero"><div class="container"><div class="eyebrow"><span class="eyebrow-dot"></span> WE’RE HERE TO CONNECT</div><h1>Let’s start<br><em>a conversation.</em></h1><p>Ask about the portal, a project, a partnership, or a listing.</p></div></section><section class="section-pad"><div class="container contact-layout"><div class="contact-copy"><div class="eyebrow">GET IN TOUCH</div><h2>Tell us how we can help.</h2><p>Choose the topic closest to your question and share a few details. In this prototype, the message is stored only in your current session.</p><div class="contact-detail"><span><i class="fa-regular fa-envelope"></i></span><div><small>EMAIL</small><strong>hello@kabulig.local</strong></div></div><div class="contact-detail"><span><i class="fa-solid fa-location-dot"></i></span><div><small>COMMUNITY FIRST</small><strong>Connecting local communities through Kabulig Portal</strong></div></div></div><form class="contact-form" method="post"><input type="hidden" name="action" value="contact"><label>Your name<input name="name" value="<?= h((string)($_SESSION['account']['name']??'')) ?>" required></label><label>Email address<input type="email" name="email" value="<?= h((string)($_SESSION['account']['email']??'')) ?>" required></label><label>Subject<input name="subject" value="<?= h($subject) ?>" required></label><label>Message<textarea name="message" rows="5" required></textarea></label><button class="btn btn-darkgreen" type="submit">Send message <span>↗</span></button></form></div></section></main>
<?php if($notice): ?><div class="toast-note" role="status"><span>✓</span> <?= h((string)$notice) ?><button type="button" aria-label="Dismiss" onclick="this.parentElement.remove()">×</button></div><?php endif; ?><?php require __DIR__.'/includes/footer.php'; ?>
