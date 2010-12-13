#!/usr/bin/perl -w
use CGI::Carp qw(fatalsToBrowser);
use HTTP::Cookies;
use LWP;
use Switch;
use HTML::Entities;
use WWW::Mechanize;
use URI::Escape;
use LWP::Debug qw(+);


#Quick Function pulled from the web to parse post actions, 
# author http://www.raven2k.com

sub populatePostFields {
  %postFields = ();
  read( STDIN, $tmpStr, $ENV{ "CONTENT_LENGTH" } );
  @parts = split( /\&/, $tmpStr );
  foreach $part (@parts) {
    ( $name, $value ) = split( /\=/, $part );
    $value =~ ( s/%23/\#/g );
    $value =~ ( s/%2F/\//g );
    $value =~ tr/'+'/' '/;
    $postFields{ "$name" } = $value;
  }
}

#To Easily Access Query Data
if (length ($ENV{'QUERY_STRING'}) > 0){
      $buffer = $ENV{'QUERY_STRING'};
      @pairs = split(/&/, $buffer);
      foreach $pair (@pairs){
           ($name, $value) = split(/=/, $pair);
           $value =~ s/%([a-fA-F0-9][a-fA-F0-9])/pack("C", hex($1))/eg;
           $query{$name} = $value; 
      }
 }


# Run 'Parse Post data' function
&populatePostFields;

#Setting Vars
my $zipCode = $postFields{ "zipCode" };;
my $mileage =  $postFields{ "mileage" };
my $year = $postFields{ "year" };
my $make = $postFields{ "make" };
my $model = $postFields{ "model" };
my $value = $postFields{ "value" };
my $trim = $query{ "trim" };
my $section = $query{ "section" };




#Setting Url to be built from pulled in values
my $url ="http://www.kbb.com/KBB/UsedCars/".$year."_".$make."_".$model."_".$value.".aspx";

#Starting Mech Object
my $mech = WWW::Mechanize->new();

#Opening mech cookie jar for file based cookie storage
$mech->cookie_jar(HTTP::Cookies->new(file => 'haggleCookies.txt',
			             autosave => 1,
				     ignore_discard =>1,
                                     ));


switch ($section) {

case 1 {



# Manually printing headers into seperate haggleHolder file in 'cookie jar' format
# - Can't stick cookie stright in hagglecookies.txt because will get overridden on $mech->get() below;
open (MYFILE, '>haggleHolder.txt');
print MYFILE "#LWP-Cookies-1.0\n\n";
print MYFILE "Set-Cookie3: PersistentZipCode=".$zipCode."; path=/; domain=www.kbb.com; path_spec; expires=2008-12-09 04:19:57Z; version=0";
close (MYFILE);

#Loading in haggleHolder content into haggleCookies jar
$mech->cookie_jar->load("haggleHolder.txt");

#Printing Content Type Header so can be viewed in browser, otherwise it will throw error
print "Content-type: text/html\n\n"; 

print $zipCode, $mileage, $year, $make, $model, $value;
print $url;


#Getting Page
$mech->get($url);



#Print Content
#Find all the links on the page matching a certain criteria
my @links = $mech->find_all_links(tag=> 'a', id_regex => qr/usedCarTrimsX_/i);
#Storing links in temp file
open (MYFILE, '>haggleLinkHolder.cgi');

my $linkRef = 0;
# Cycling thru all the links and creating references stored in a file.
foreach my $link (@links) {
#my $Links = "<br /><a href=\"".uri_unescape($link->url)."id=\"".uri_unescape($link->text)."\">".uri_unescape($link->text)."</a><br />";
   $linkRef=$linkRef+1;
   my $theLink = "<br /><a href=\"grab-price.cgi?section=2&trim=".$linkRef."\"id=\"".uri_escape($link->url)."\">".uri_unescape($link->text)."</a><br />";
   
   #Removing .. from starting of link url.
   my $urlLink = uri_escape($link->url);
    substr($urlLink, 0, 1) = "";
   #Throwing it into a flat database  
   print $theLink."\n";
   print $urlLink;
   print MYFILE $linkRef."|".$urlLink."\n";
   
}

close (MYFILE);


     };# end case 1


# SECTION 2#######################################################
case 2 {
   
   #Printing Content Type Header so can be viewed in browser, otherwise it will throw error
   print "Content-type: text/html\n\n"; 

  my $data_file="haggleLinkHolder.cgi";
   open(MYFILE, $data_file) || die("Could not open file!");
   
   ## Assign Data to array;
   my @raw_data=<MYFILE>; 

    foreach $linkLine(@raw_data){

        chop($linkLine);
	($linkRef,$linkUrl)=split(/\|/,$linkLine);
        if($linkRef){
           print $linkUrl;
         } 
        
	};
     print $trim;
   close (MYFILE);
   
      };# end case 2




}; # End Section Switch




