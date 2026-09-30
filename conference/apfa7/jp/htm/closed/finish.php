<?php
    require_once('../../../config.php');
    mb_language('Japanese');
    mb_internal_encoding('UTF-8');
    mb_http_output("UTF-8");

    $smarty = new Smarty;

    $smarty->template_dir = $template_dir;
    $smarty->compile_dir = $compile_dir;

    $lang = stripslashes($_POST['lang']);
    $FamilyName = stripslashes($_POST['FamilyName']);
    $LastName = stripslashes($_POST['LastName']);
    $FamilyKana = stripslashes($_POST['FamilyKana']);
    $LastKana = stripslashes($_POST['LastKana']);
    $honorific = stripslashes($_POST['honorific']);
    $status = stripslashes($_POST['status']);
    $mailaddress = stripslashes($_POST['mailaddress']);
    $institution_name = stripslashes($_POST['institution_name']);
    $zip_code = stripslashes($_POST['zip_code']);
    $address = stripslashes($_POST['address']);
    $tel = stripslashes($_POST['tel']);
    $fax = stripslashes($_POST['fax']);
    $p_info = stripslashes($_POST['p_info']);
    $title = stripslashes($_POST['title']);
    $keywords = stripslashes($_POST['keywords']);
    $abstract = stripslashes($_POST['abstract']);
    $comment = stripslashes($_POST['comment']);
    $basename = stripslashes($_POST['basename']);
    $event1 = stripslashes($_POST['event1']);
    $event2 = stripslashes($_POST['event2']);
    
    if($lang == ""){
        header("Location: finish.html");
        exit;
    }
    
$error = array();
if($_POST['FamilyName'] == ""){
    $error[] = "氏名（姓）は入力必須項目です。";
}
if($_POST['LastName'] == ""){
    $error[] = "氏名（名）は入力必須項目です。";
}
if($_POST['FamilyKana'] == ""){
    $error[] = "ふりがな（姓）は入力必須項目です。";
}
if($_POST['LastKana'] == ""){
    $error[] = "ふりがな（名）は入力必須項目です。";
}
if($_POST['honorific'] == ""){
    $error[] = "敬称は入力必須項目です。";
}
if($_POST['status'] == ""){
    $error[] = "職業は入力必須項目です。";
}
if($_POST['mailaddress'] == ""){
    $error[] = "E-Mailは入力必須項目です。";
}
if($_POST['mailaddress'] != ""){
    if(!preg_match("/^[\w.-]+\@([\w-]+\.)+\w+$/",$_POST['mailaddress'])){
        $error[]= "有効ではないE-Mailです。";
    }
}
if($_POST['institution_name'] == ""){
    $error[] = "機関名は入力必須項目です。";
}
if($_POST['zip_code'] == ""){
    $error[] = "郵便番号は入力必須項目です。";
}
if($_POST['zip_code'] != ""){
    if(strlen($data['zip_code']) > 20){
        $error[]= "郵便番号は20文字以内で入力してください。";
    }
}
if($_POST['address'] == ""){
    $error[] = "住所は入力必須項目です。";
}
if($_POST['tel'] == ""){
    $error[] = "電話番号は入力必須項目です。";
}
if($_POST['tel'] != ""){
    if(strlen($data['tel']) > 30){
        $error[]= "電話番号は30文字以内で入力してください。";
    }
}
if(strlen($_POST['fax']) > 30){
    $error[]= "FAX番号は30文字以内で入力してください。";
}
if($_POST['p_info'] == ""){
    $error[] = "登録内容は入力必須項目です。";
}

if($_POST['p_info'] != "No (Observer)"){ 
    if($_POST['title'] == ""){
        $error[] = "Give proposed titleは入力必須項目です。";
    }
    if($_POST['keywords'] == ""){
        $error[] = "Keywordsは入力必須項目です。";
    }
    if(!ereg(".pdf$", $_POST['abstract'])){
        
        $error[] = "Abstractは.pdfの拡張子でアップロードしてください。";
    }
}


if($data['p_info'] == "No (Observer)"){
    $data['title'] = "";
    $data['keywords'] = "";
    $data['abstract'] = "";
}
    
    if(count($error) != 0){
        $smarty->display('error.html');
        exit;
    }

    $submit = $_POST['submit'];

    if($event1 == ""){
        $event = $event2;
    }else{
        $event = $event1;
    }

    if($event1 != "" && $event2 != ""){
        $event = $event1.",".$event2;
    }

    //db接続
    $link = mysql_connect($db_server,$db_username,$db_password) or die("MySQLへの接続に失敗しました。");
    $db = mysql_select_db($db_name,$link) or die("DBへの接続に失敗しました。");
    mysql_query('SET NAMES ujis', $link);

    //シーケンス番号取得
    $sql = "UPDATE sequence SET id = LAST_INSERT_ID(id+1)";
    mysql_query($sql,$link);
    $sql = "SELECT LAST_INSERT_ID()";
    $num = mysql_query($sql,$link);
    $id = mysql_fetch_assoc($num);
    $id = $id['LAST_INSERT_ID()'];

    $sql = sprintf("INSERT INTO member(ID,FamilyName,LastName,FamilyKana,LastKana,honorific,status,mailaddress,institution_name,zip_code,address,tel,fax,p_info,title,keywords,abstract,event,comment,lang) 
            values('%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s')",
                mysql_real_escape_string(mb_convert_encoding($id,"EUC-JP","UTF-8"), $link),
                mysql_real_escape_string(mb_convert_encoding($FamilyName,"EUC-JP","UTF-8"), $link),
                mysql_real_escape_string(mb_convert_encoding($LastName,"EUC-JP","UTF-8"), $link),
                mysql_real_escape_string(mb_convert_encoding($FamilyKana,"EUC-JP","UTF-8"), $link),
                mysql_real_escape_string(mb_convert_encoding($LastKana,"EUC-JP","UTF-8"), $link),
                mysql_real_escape_string(mb_convert_encoding($honorific,"EUC-JP","UTF-8"), $link),
                mysql_real_escape_string(mb_convert_encoding($status,"EUC-JP","UTF-8"), $link),
                mysql_real_escape_string(mb_convert_encoding($mailaddress,"EUC-JP","UTF-8"), $link),
                mysql_real_escape_string(mb_convert_encoding($institution_name,"EUC-JP","UTF-8"), $link),
                mysql_real_escape_string(mb_convert_encoding($zip_code,"EUC-JP","UTF-8"), $link),
                mysql_real_escape_string(mb_convert_encoding($address,"EUC-JP","UTF-8"), $link),
                mysql_real_escape_string(mb_convert_encoding($tel,"EUC-JP","UTF-8"), $link),
                mysql_real_escape_string(mb_convert_encoding($fax,"EUC-JP","UTF-8"), $link),
                mysql_real_escape_string(mb_convert_encoding($p_info,"EUC-JP","UTF-8"), $link),
                mysql_real_escape_string(mb_convert_encoding($title,"EUC-JP","UTF-8"), $link),
                mysql_real_escape_string(mb_convert_encoding($keywords,"EUC-JP","UTF-8"), $link),
                mysql_real_escape_string(mb_convert_encoding($abstract,"EUC-JP","UTF-8"), $link),
                mysql_real_escape_string(mb_convert_encoding($event,"EUC-JP","UTF-8"), $link),
                mysql_real_escape_string(mb_convert_encoding($comment,"EUC-JP","UTF-8"), $link),
                mysql_real_escape_string(mb_convert_encoding($lang,"EUC-JP","UTF-8"), $link));
    mysql_query($sql,$link);
    mysql_close($link);

    
    //tmpfile移動
    
    $abstract = basename("/" . str_replace("\0","",$abstract));
    if($basename != ""){
        if(file_exists($tmpdir . "/" . $basename) == true){
            rename($tmpdir . "/" . $basename, $uploaddir . "/" . $id . "_" . $abstract);
            header("Location: finish.html");
            //$smarty->display('finish.html');
        }else{
            header("Location: uploaderror.html");
        }
    }else{
        header('location: finish.html');
        //$smarty->display('finish.html');
    }
    
$to = $mailaddress;
$subject  = "『東工大・一橋大国際会議 & APFA7』登録完了";
$message  = $FamilyName." ".$LastName." 様
受付番号：".$id."

この度は『東工大・一橋大国際会議 & APFA7』に参加、投稿の
お申し込みをいただき誠にありがとうございます。
ご登録を正常に受け付けましたので、ご通知申し上げます。

登録内容の変更、キャンセル等がございましたら、
下記連絡先までメールにてご連絡くださいますよう
宜しくお願い申し上げます。

当日のご来場を心よりお待ちしております。


＜参加登録料＞
登録料は下記のとおりです。
一般参加者：4万円
学生：1万5千円
一般傍聴者：1万円

支払いは、会議開催中に受付にてお願いします。（現金の用意をお願いします）


こちらのメールの内容にお心当たりのない場合は、大変お手数ですが、
その旨を明記の上、上記メールアドレスまでご連絡ください。

-- 
【当カンファレンスについてのお問い合わせ先】
THIC & APFA7運営事務局
http://www.thic-apfa7.com/
E-mail: info@thic-apfa7.com
";
$header = "From: info@thic-apfa7.com\n";

mb_send_mail($to,$subject,$message,$header);
    
    
    