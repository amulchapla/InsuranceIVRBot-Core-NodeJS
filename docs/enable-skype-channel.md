# Enabling Skype Calling Channel

Before you can talk to your bot, you must enable the Skype Channel and configure it for calling.

1. Navigate to the [Azure Portal][1] and find your bot registration
    > *Navigate directly to your bot by replacing the following URL {template} values:*
    > https://portal.azure.com/#resource/subscriptions/{subscription}/resourceGroups/{resourceGroup}/providers/Microsoft.BotService/botServices/{botService}/channels
1. Click `Channels` in the left menu blade.
1. Click the `Skype` logo under the **Featured Channels** heading.
1. Click the `Calling` tab on the **Configure Skype** page.
1. Select the option for `Enable calling`.
1. Select the option for `IVR 1:1 IVR audio calls`.
1. Set your `Webhook` endpoint to `https://YOUR_WEB_APP_NAME.azurewebsites.net/api/calls`
1. Click `Save` to complete the configuration.

[1]: https://portal.azure.com/