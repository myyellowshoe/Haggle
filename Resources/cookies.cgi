#!/usr/bin/perl -w
use CGI::Carp qw(fatalsToBrowser);
use HTTP::Cookies;
use LWP;
use WWW::Mechanize;
use LWP::Debug qw(+);








my $mech = WWW::Mechanize->new();
$mech->cookie_jar(HTTP::Cookies->new(file => "lwpcookies.txt",
                    		     autosave => 1,
                                     ignore_discard => 1));
$mech->cookie_jar->set_cookie(-name=>'PersistentZipCode',
                              -value=>'15213',
                              -host=>'.kbb.com',
                              -expires=>'Thu, 04 Dec 2008 18:23:16 GMT',
                              -path=>'/',
                              -secure=>'false');

#- User configurable variables 
$expDate = "09-Nov-09 00:00:00 GMT";
#set this to your domain prepended with a .
$domain = ".kbb.com";
$path = "/"; 
$url ="http://www.kbb.com/kbb/UsedCars/default.aspx";



# be sure to print a MIM type AFTER cookie headers and follow with a blank line


my $cookie = "Set-Cookie: iscookietext\; ";
$cookie .= "expires=Wednesday, 09-Nov-1999 00:00:00 GMT\; ";
$cookie .= "path=\/\; ";
$cookie .= "domain=\.mmyserver.com\; ";
print "Content-type: text/plain\n",
print "$cookie\n\n";
print "Content-type: text/html\n\n";

$mech->get($url);
print $mech->content();