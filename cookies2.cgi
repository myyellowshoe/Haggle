#!/usr/bin/perl -w
use CGI::Carp qw(fatalsToBrowser);
use HTTP::Cookies;
use LWP;
use LWP::Debug qw(+);
use WWW::Mechanize;



#- User configurable variables ------------------------------------------------#
$expDate = "09-Nov-09 00:00:00 GMT";
#set this to your domain prepended with a .s
$domain = ".richardsjustin.com";
$path = "/"; 


#- Set Cookie -----------------------------------------------------------------#
sub setCookie {
	# end a set-cookie header with the word secure and the cookie will only
	# be sent through secure connections
	local($name, $value, $expiration, $path, $domain, $secure) = @_;

	print "Set-Cookie: ";
	print ($name, "=", $value, "; expires=", $expiration,
		"; path=", $path, "; domain=", $domain, "; ", $secure, "\n");
}
#------------------------------------------------------------------------------#

&setCookie("user", "dbewley",  $expDate, $path, $domain);
&setCookie("user_addr", $ENV{'REMOTE_HOST'},  $expDate, $path, $domain);

# be sure to print a MIM type AFTER cookie headers and follow with a blank line
print "Content-type: text/html\n\n"; 
