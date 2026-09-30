<?php
require_once('../../../config.php');
    mb_language('Japanese');
    mb_internal_encoding('UTF-8');
    mb_http_output("UTF-8");
    
$smarty = new Smarty;

$smarty->template_dir = $template_dir;
$smarty->compile_dir = $compile_dir;

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
$data['abstract'] = htmlspecialchars($_POST['abstract']);
$data['comment'] = htmlspecialchars($_POST['comment']);
$data['privacy'] = htmlspecialchars($_POST['privacy']);
$data['event1'] = htmlspecialchars($_POST['event1']);
$data['event2'] = htmlspecialchars($_POST['event2']);
$data['country'] = htmlspecialchars($_POST['country']);

$select_honorific = array("Mr." => "Mr." , "Ms." => "Ms." , "Dr." => "Dr." , "Prof." => "Prof.");

$select_status = array("学生" , "その他" );
$select_status_en = array("Student" , "Other" );

$select_status_val = array("Student", "Other");

$select_p_info = array("口頭発表","ポスター発表","聴講のみ");
$select_p_info_en = array("Yes (Oral)","Yes (Poster)","No (Observer only)");

$select_p_info_val = array("Oral","Poster","No (Observer)");
$select_keywords = array("Financial markets" => "Financial markets","Sales data" => "Sales data","Company data" => "Company data",
                            "Website information data" => "Website information data","Data analysis methods" => "Data analysis methods",
                            "Physics concepts" => "Physics concepts","Social phenomena" => "Social phenomena");


$smarty->assign('select_honorific', $select_honorific);
$smarty->assign('select_status', $select_status);
$smarty->assign('select_status_en', $select_status_en);
$smarty->assign('select_status_val', $select_status_val);
$smarty->assign('select_p_info', $select_p_info);
$smarty->assign('select_p_info_en', $select_p_info_en);
$smarty->assign('select_p_info_val', $select_p_info_val);
$smarty->assign('select_keywords', $select_keywords);
$smarty->assign('data', $data);
$smarty->display('en_regist.html');


