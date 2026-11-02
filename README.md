# pingOneAutoClicker

Chrome Extension to click "Sign On" for Ping One

## Installation

This is a chrome extension, you can install it on the Chrome Web Store.

## Usage

By default, this extension will click "Sign On" when you are on the "Sign On" page after 5 seconds.

If you're impatient, you can click the extension icon to set the time to 1, 3 or 5 seconds.

## Local development

You can also use this extension locally.

If you're not able to install it on the Chrome Web Store, you can use the following command to install it:

1. Download this repository and extract it to a folder.
2. Open Chrome and go to chrome://extensions.
3. Click "Load unpacked extension...".
4. Select the folder containing the extension.
5. Click "Load".

### Packing the extension

Let's understand whats needed.  A zip file.
To that we will zip the content of /src into the /dist/${version} from package.json

## Privacy

This extension does not collect any personal information and only uses your google cloud sync storage to store the time to click the button.

## Source and delivery

This is a publication mirror when viewed on GitHub. Forgejo is the canonical
code home; changes pushed directly to the mirror may be overwritten. GitHub
Issues remains the public feedback inbox. Resolve the canonical code home with
the owner before preparing changes.

Forgejo checks the packaged extension, referenced files, JavaScript syntax and
landing page before asking Coolify to deploy the tested main commit. Coolify
keeps the existing chrome-ping.jace.pro domain, Compose configuration and target.
The landing page has no persistent application database.
