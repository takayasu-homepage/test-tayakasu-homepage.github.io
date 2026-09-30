<?php
    require_once('../config.php');
    mb_language('Japanese');
    mb_internal_encoding('UTF-8');
    mb_http_output("UTF-8");
    
    $smarty = new Smarty;
    $smarty->template_dir = $template_dir;
    $smarty->compile_dir = $compile_dir;

    $abstract = basename("/" . str_replace("\0","",$_GET['abstract']));
    $id = htmlspecialchars($_GET['id']);
    $mode = htmlspecialchars($_GET['mode']);

    if($mode == "pdf"){
        $filename = $uploaddir . "/" . $id . "_" . $abstract;
        if(!file_exists($filename)){
            die("ファイルがありません。");
        }
        
        $files = fopen($filename, "r");
        $filesize = filesize($filename);
        mb_http_output("none");
        header("Content-Type: application/octet-stream;");
        header("Content-Length: " . $filesize);
        $filename = $id."_".$abstract;
        $filename2 = preg_replace('/\. +/',".",$filename);
        $filename2 = str_replace(" ","_",$filename2);
        header("Content-disposition: attachment; filename=" . $filename2);
        print fread($files, $filesize);
        fclose($files);
    }

    if($mode == "all"){
        $link = mysql_connect($db_server,$db_username,$db_password) or die("MySQLへの接続に失敗しました。");
        $db = mysql_select_db($db_name,$link) or die("DBへの接続に失敗しました。");
        mysql_query('SET NAMES ujis', $link);

                $now = date("Ymd");
                mb_http_output("pass");
                header("Content-Type: text/tsv; "); 
                $filename = "registrantdata_".$now.".tsv";
               
                header("Content-disposition: attachment; filename=" . $filename);
                
                $sql = 'SELECT * FROM member ORDER BY ID';
                $hoge = mysql_query($sql,$link);
                
                
                print (mb_convert_encoding("受付番号\t名前（姓）\t名前（名）\tふりがな（姓）\tふりがな（名）\t敬称\t職業\tE-Mail\t機関名\t郵便番号\t住所\tCountry\t電話番号\tFAX番号\t登録内容\tGive proposed title\tKeywords\tファイル名\tイベント参加\tComment\t日英\t登録日時\r\n","SJIS-win","UTF-8"));
                while($rows = mysql_fetch_assoc($hoge)){
                    foreach($rows as $key => $val){
                        $val = str_replace("\r\n","\n",$val);
                        $val = str_replace('""','"',$val);
                        $rows[$key] = '"'.$val.'"';
                    }
                    $tsv = implode("\t",$rows);
                    print (mb_convert_encoding($tsv."\r\n","SJIS-win","EUC-JP"));
                }
                
        mysql_close($link);
    }
