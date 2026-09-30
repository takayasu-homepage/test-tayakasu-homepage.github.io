<?php
require_once('../../../config.php');
    mb_language('Japanese');
    mb_internal_encoding('UTF-8');
    mb_http_output("UTF-8");
$smarty = new Smarty;

$smarty->template_dir = $template_dir;
$smarty->compile_dir = $compile_dir;

$data['lang'] = htmlspecialchars($_POST['lang']);
$data['FamilyName'] = htmlspecialchars($_POST['FamilyName']);
$data['LastName'] = htmlspecialchars($_POST['LastName']);
$data['FamilyKana'] = htmlspecialchars($_POST['FamilyKana']);
$data['LastKana'] = htmlspecialchars($_POST['LastKana']);
$data['honorific'] = htmlspecialchars($_POST['honorific']);
$data['status'] = htmlspecialchars($_POST['status']);
$data['mailaddress'] = htmlspecialchars($_POST['mailaddress']);
$data['mailaddress2'] = htmlspecialchars($_POST['mailaddress2']);
$data['institution_name'] = htmlspecialchars($_POST['institution_name']);
$data['zip_code'] = htmlspecialchars($_POST['zip_code']);
$data['address'] = htmlspecialchars($_POST['address']);
$data['tel'] = htmlspecialchars($_POST['tel']);
$data['fax'] = htmlspecialchars($_POST['fax']);
$data['p_info'] = htmlspecialchars($_POST['p_info']);
$data['title'] = htmlspecialchars($_POST['title']);
$data['keywords'] = htmlspecialchars($_POST['keywords']);
$data['abstract'] = htmlspecialchars($_FILES['abstract']['name']);
$data['comment'] = htmlspecialchars($_POST['comment']);
$data['privacy'] = htmlspecialchars($_POST['privacy']);
$data['event1'] = htmlspecialchars($_POST['event1']);
$data['event2'] = htmlspecialchars($_POST['event2']);

$data['abstract'] = str_replace(" ","_",$data['abstract']);
$data['abstract'] = str_replace("　","_",$data['abstract']);

$error = array();
if($data['FamilyName'] == ""){
    $error[] = "氏名（姓）は入力必須項目です。";
}
if($data['LastName'] == ""){
    $error[] = "氏名（名）は入力必須項目です。";
}
if($data['FamilyKana'] == ""){
    $error[] = "ふりがな（姓）は入力必須項目です。";
}
if($data['LastKana'] == ""){
    $error[] = "ふりがな（名）は入力必須項目です。";
}
if($data['honorific'] == ""){
    $error[] = "敬称は入力必須項目です。";
}
if($data['status'] == ""){
    $error[] = "職業は入力必須項目です。";
}
if($data['mailaddress'] == ""){
    $error[] = "E-Mailは入力必須項目です。";
}
if($data['mailaddress'] != ""){
    if(!preg_match("/^[\w.-]+\@([\w-]+\.)+\w+$/",$data['mailaddress'])){
        $error[]= "有効ではないE-Mailです。";
    }
}
if($data['mailaddress'] != $data['mailaddress2']){
    $error[] = "再入力されたE-Mailが一致しません。";
}
if($data['institution_name'] == ""){
    $error[] = "機関名は入力必須項目です。";
}
if($data['zip_code'] == ""){
    $error[] = "郵便番号は入力必須項目です。";
}
if($data['zip_code'] != ""){
    if(strlen($data['zip_code']) > 20){
        $error[]= "郵便番号は20文字以内で入力してください。";
    }
}
if($data['address'] == ""){
    $error[] = "住所は入力必須項目です。";
}
if($data['tel'] == ""){
    $error[] = "電話番号は入力必須項目です。";
}
if($data['tel'] != ""){
    if(strlen($data['tel']) > 30){
        $error[]= "電話番号は30文字以内で入力してください。";
    }
}
if(strlen($data['fax']) > 30){
    $error[]= "FAX番号は30文字以内で入力してください。";
}
if($data['p_info'] == ""){
    $error[] = "登録内容は入力必須項目です。";
}

if($data['p_info'] != "No (Observer)"){ 
    if($data['title'] == ""){
        $error[] = "Give proposed titleは入力必須項目です。";
    }
    if($data['keywords'] == ""){
        $error[] = "Keywordsは入力必須項目です。";
    }
    if(!ereg("\.pdf$", $data['abstract'])){
        
        $error[] = "Abstractは.pdfの拡張子でアップロードしてください。";
    }
}

if($data['privacy'] == ""){
    $error[] = "プライバシーポリシーに同意してください。";
}

if($data['p_info'] == "No (Observer)"){
    $data['title'] = "";
    $data['keywords'] = "";
    $data['abstract'] = "";
}


//tmpfileuplaod
if($data['p_info'] != "No (Observer)"){ 
    $uploadfile = tempnam($tmpdir, md5(microtime().rand(1,10000)));
    if (!move_uploaded_file($_FILES['abstract']['tmp_name'], $uploadfile)) {
         $error[] = "ファイルが選択されていないか、ファイルのサイズが2MBを超えている可能性があります。";
    }
}

if(count($error) != 0){
    $smarty->assign('data', $data);
    $smarty->assign('error', $error);
    $smarty->display('error.html');
    exit;
}

if($data['p_info'] != "No (Observer)"){ 
    $data['basename'] = basename($uploadfile);
    chmod($uploadfile, 0666);

    //tmpのディレクトリ内のファイルで、更新日時が1時間前以前のファイルを削除する。
    $deltime = date( "y.m.d H:i:s", mktime(date("H"),date("i")-1,date("s"),date("m"),date("d"),date("y")));
    if ($handle = opendir($tmpdir)) {
        while (false !== ($file = readdir($handle))) {
            if ($file != "." && $file != "..") {
                $filetime = date("y.m.d H:i:s", filemtime($tmpdir. "/" .$file));
                if($filetime < $deltime){
                    unlink($tmpdir. "/" .$file);
                }
            }
        }
        closedir($handle);
    }
}

$smarty->assign('data', $data);
$smarty->display('confirm.html');