$appdirectory="C:/AI/Bot/InsuranceServicesIVRBot/InsuranceIVRBot-Core-NodeJS/dist"
$webappname="ivrweb6qpeihajc"
$resourcegroupname = "voicebot"

Login-AzureRmAccount

# Create a resource group - RG already created
# New-AzureRmResourceGroup -Name myResourceGroup -Location $location
# Create an App Service plan in `Free` tier.
# New-AzureRmAppServicePlan -Name $webappname -Location $location -ResourceGroupName myResourceGroup -Tier Free
# Create a web app.
# New-AzureRmWebApp -Name $webappname -Location $location -AppServicePlan $webappname -ResourceGroupName myResourceGroup

# Get publishing profile for the web app
$xml = [XML] (Get-AzureRmWebAppPublishingProfile -Name $webappname `
-ResourceGroupName $resourcegroupname -OutputFile null)

# Extract connection information from publishing profile
$username = $xml.SelectNodes("//publishProfile[@publishMethod=`"FTP`"]/@userName").value
$password = $xml.SelectNodes("//publishProfile[@publishMethod=`"FTP`"]/@userPWD").value
$url = $xml.SelectNodes("//publishProfile[@publishMethod=`"FTP`"]/@publishUrl").value

# Upload files recursively 
Set-Location $appdirectory
$webclient = New-Object -TypeName System.Net.WebClient
$webclient.Credentials = New-Object System.Net.NetworkCredential($username,$password)
$files = Get-ChildItem -Path $appdirectory -Recurse | Where-Object{!($_.PSIsContainer)}
foreach ($file in $files)
{
    $relativepath = (Resolve-Path -Path $file.FullName -Relative).Replace(".\", "").Replace('\', '/')
    $uri = New-Object System.Uri("$url/$relativepath")
    "Uploading to " + $uri.AbsoluteUri
    $webclient.UploadFile($uri, $file.FullName)
} 
$webclient.Dispose()