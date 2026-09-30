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
    $country = stripslashes($_POST['country']);

    if($lang == ""){
        header("Location: en_finish.html");
        exit;
    }
    if($data['lang'] == "en"){
        if($data['LastName'] == ""){
            $error[] = "Last Name is invalid";
        }
        if($data['FamilyName'] == ""){
            $error[] = "First Name is invalid";
        }
        if($data['honorific'] == ""){
            $error[] = "Honorific is invalid";
        }
        if($data['status'] == ""){
            $error[] = "Status is invalid";
        }
        if($data['mailaddress'] == ""){
            $error[] = "E-mail is invalid";
        }
        if($data['mailaddress'] != ""){
            if(!preg_match("/^[\w.-]+\@([\w-]+\.)+\w+$/",$data['mailaddress'])){
                $error[]= "E-mail is invalid";
            }
        }
        if($data['institution_name'] == ""){
            $error[] = "Name is invalid";
        }
        if($data['zip_code'] == ""){
            $error[] = "Zip Code is invalid";
        }

        if($data['zip_code'] != ""){
            if(strlen($data['zip_code']) > 20){
                $error[]= "Zip Code is invalid";
            }
        }
        if($data['country'] == ""){
            $error[] = "Country is invalid";
        }

        if($data['address'] == ""){
            $error[] = "Address is invalid";
        }
        if($data['tel'] == ""){
            $error[] = "Telephone is invalid";
        }
        if($data['tel'] != ""){
            if(strlen($data['tel']) > 30){
                $error[]= "Telephone is invalid";
            }
        }
        if(strlen($data['fax']) > 30){
            $error[]= "FAX is invalid";
        }
        if($data['p_info'] == ""){
            $error[] = "make a presentation is invalid";
        }

        if($data['p_info'] != "No (Observer)"){ 
            if($data['title'] == ""){
                $error[] = "Provide proposed title is invalid。";
            }
            if($data['keywords'] == ""){
                $error[] = "Keywords is invalid";
            }
            if(!ereg(".pdf$", $data['abstract'])){
                
                $error[] = "Abstract is invalid。";
            }
        }

    }
    if($data['p_info'] == "No (Observer)"){
        $data['title'] = "";
        $data['keywords'] = "";
        $data['abstract'] = "";
    }

    if(count($error) != 0){
        $smarty->display('en_error.html');
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

    $sql = sprintf("INSERT INTO member(ID,FamilyName,LastName,FamilyKana,LastKana,honorific,status,mailaddress,institution_name,zip_code,address,country,tel,fax,p_info,title,keywords,abstract,event,comment,lang) 
            values('%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s')",
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
                mysql_real_escape_string(mb_convert_encoding($country,"EUC-JP","UTF-8"), $link),
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
            header("Location: en_finish.html");
            //$smarty->display('en_finish.html');
        }else{
            header("Location: en_uploaderror.html");
        }
    }else{
        header("Location: en_finish.html");
        //$smarty->display('en_finish.html');
    }


$to = $mailaddress;
$subject  = "[THIC & APFA7] Registration";
$message  = "Dear ".$honorific." ".$FamilyName." ".$LastName.",
Registration number: ".$id."

Thank you for your application to attend THIC & APFA7.
We have received your registration details.


The registration fees are:

Full: 40,000 Yen,
Student: 15,000 Yen,
Observer: 10,000 Yen.

Payment:
The registration fee should be paid at the conference reception in Japanese yen (JPY).


If you have any questions, please contact:
-- 
THIC & APFA7 Secretariat
http://www.thic-apfa7.com/en/htm/
E-mail: info@thic-apfa7.com";

$header = "From: info@thic-apfa7.com\n";

mb_send_mail($to,$subject,$message,$header);
    