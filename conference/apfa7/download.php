<?php
    require_once('../config.php');
    mb_language('Japanese');
    mb_internal_encoding('UTF-8');
    mb_http_output("UTF-8");
    $smarty = new Smarty;

    $smarty->template_dir = $template_dir;
    $smarty->compile_dir = $compile_dir;

    $link = mysql_connect($db_server,$db_username,$db_password) or die("MySQLへの接続に失敗しました。");
    $db = mysql_select_db($db_name,$link) or die("DBへの接続に失敗しました。");
    mysql_query('SET NAMES ujis', $link);
    $sql = 'SELECT * FROM member ORDER BY ID';

    if(!$hoge = mysql_query($sql,$link)){
        echo mysql_errno($link) . ": " . mysql_error($link). "\n";
        exit();
    }
    while($rows = mysql_fetch_assoc($hoge)){
        $data[] = $rows;
    }
    
    if(count($data) == 0){
        $error = "ファイルが登録されていません。";
        
    }else{
    
        $i=0;
        $num=0;
        $hoge = array();
        foreach($data as $val){
            if($data[$i]['abstract'] != ""){
                $dl_pdf[$num]['ID'] = $data[$i]['ID'];
                $dl_pdf[$num]['abstract'] = $data[$i]['abstract'];
                $num++;
            }
            $i++;
        }
    }
    mysql_close($link);
    $smarty->assign('dl_pdf', $dl_pdf);
    $smarty->assign('error', $error);
    $smarty->display('download.html');


