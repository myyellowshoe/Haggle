#!/usr/bin/perl -w
use CGI::Carp qw(fatalsToBrowser);
use HTTP::Cookies;
use LWP;
use WWW::Mechanize;
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
    $postFields{ "$name" } = $value;
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

#Setting Url to be built from pulled in values
my $url ="http://www.kbb.com/KBB/UsedCars/".$year."_".$make."_".$model."_".$value.".aspx";

#Starting Mech Object
my $mech = WWW::Mechanize->new();

#Opening mech cookie jar for file based cookie storage
$mech->cookie_jar(HTTP::Cookies->new(file => 'haggleCookies.txt',
			             autosave => 1,
				     ignore_discard =>1,
                                     ));

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

#Getting Page
$mech->get($url);

#Print Content
print $mech->content();