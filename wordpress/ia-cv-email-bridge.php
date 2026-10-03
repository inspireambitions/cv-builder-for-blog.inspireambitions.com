<?php
// Install as a global Code Snippets snippet. Keep access keys out of source.
add_action('rest_api_init',function(){
register_rest_route('ia-mail/v1','/cv-welcome',array('methods'=>array('GET','POST'),'permission_callback'=>function($request){ if(current_user_can('manage_options'))return true; $hash=get_option('ia_cv_mail_bridge_secret_hash',''); $header=(string)$request->get_header('authorization'); if(!$hash||strpos($header,'Bearer ')!==0||!wp_check_password(substr($header,7),$hash))return new WP_Error('bridge_unauthorised','Authentication required.',array('status'=>401)); return true; },'callback'=>function($request){
if($request->get_method()==='GET'){$settings=get_option('fluentmail-settings',array());$default=$settings['misc']['default_connection']??'';$ready=($settings['connections'][$default]['provider']??'')==='cloudflare'&&($settings['misc']['simulate_emails']??'no')!=='yes';return rest_ensure_response(array('ready'=>$ready));}
$email=strtolower(trim((string)$request->get_param('email')));$name=substr(sanitize_text_field((string)$request->get_param('firstName')),0,80);$format=substr(sanitize_key((string)$request->get_param('format')),0,64);
if(!is_email($email))return new WP_Error('invalid_email','Enter a valid email address.',array('status'=>400));
$key='ia_cv_mail_'.hash('sha256',wp_json_encode(array($email,$name,$format)));
$now=time();$previous=get_option($key,false);
if(is_array($previous)&&($previous['expires']??0)<$now){delete_option($key);$previous=false;}
if(!add_option($key,array('state'=>'pending','expires'=>$now+DAY_IN_SECONDS),'',false)){
$previous=get_option($key,false);
if(($previous['state']??'')==='sent')return rest_ensure_response(array('sent'=>true,'deduped'=>true));
return new WP_Error('send_pending','The confirmation is already being processed.',array('status'=>503));}
wp_schedule_single_event($now+DAY_IN_SECONDS+60,'ia_cv_mail_ledger_expire',array($key));
$html='<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#1c1d1f"><h1>Your CV downloads are unlocked</h1><p>Greetings from Inspire Ambitions'.($name!==''?', '.esc_html($name):'').'.</p><p>You can return to the CV builder on this device and download PDF or Word without entering your email again.</p><h2>Three quick Gulf CV checks</h2><ol><li>State your current location and notice period.</li><li>Use numbers to prove results.</li><li>Match only skills you can support with evidence.</li></ol><p><a href="https://cv.inspireambitions.com">Return to the free CV builder</a></p><p>If the tool helped, leave an honest review on <a href="https://www.trustpilot.com/evaluate/inspireambitions.com">Trustpilot</a>. We ask every user the same way.</p><p style="font-size:12px;color:#666">You can unsubscribe from any guidance email with one tap.</p></div>';
$sent=wp_mail($email,'Your free CV downloads are unlocked',$html,array('Content-Type: text/html; charset=UTF-8','From: Inspire Ambitions <notifications@inspireambitions.com>','Reply-To: Inspire Ambitions <hello@inspireambitionshq.com>','X-CV-Request-ID: '.substr($key,11)));
update_option($key,array('state'=>$sent?'sent':'uncertain','expires'=>$now+DAY_IN_SECONDS),false);
if(!$sent)return new WP_Error('email_failed','The confirmation could not be sent.',array('status'=>502));
return rest_ensure_response(array('sent'=>true,'deduped'=>false));
}));
});
add_action('ia_cv_mail_ledger_expire',function($key){if(is_string($key)&&preg_match('/^ia_cv_mail_[a-f0-9]{64}$/',$key))delete_option($key);});
add_action('admin_init',function(){
register_setting('ia_cv_mail_bridge','ia_cv_mail_bridge_secret_hash',array('type'=>'string','sanitize_callback'=>function($value){
if($value==='')return get_option('ia_cv_mail_bridge_secret_hash','');
if(strlen($value)<32){add_settings_error('ia_cv_mail_bridge','short_secret','Use at least 32 characters.');return get_option('ia_cv_mail_bridge_secret_hash','');}
return wp_hash_password($value);
}));
});
add_action('admin_menu',function(){add_options_page('CV Email Bridge','CV Email Bridge','manage_options','ia-cv-email-bridge',function(){
if(!current_user_can('manage_options'))return;
echo '<div class="wrap"><h1>CV Email Bridge</h1><p>Uses the saved Cloudflare connection. Only authenticated requests can send the fixed CV confirmation. Duplicate requests share a 24-hour delivery record.</p>';
echo '<p>Access key status: '.(get_option('ia_cv_mail_bridge_secret_hash','')?'Configured':'Not configured').'</p>';
echo '<form method="post" action="options.php">';settings_fields('ia_cv_mail_bridge');
echo '<label for="ia-cv-secret">Dedicated CV bridge access key, at least 32 characters</label><p><input type="password" id="ia-cv-secret" name="ia_cv_mail_bridge_secret_hash" value="" size="60" autocomplete="new-password"></p><p>Enter this same key privately in Vercel as IA_CV_EMAIL_BRIDGE_SECRET. The website stores a password hash. Leave blank to keep the existing key.</p>';
submit_button('Save CV bridge key');echo '</form></div>';
});});
