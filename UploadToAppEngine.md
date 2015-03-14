# Upload to App Engine #

Even though the editor consists of static resources only (JavaScript and images) it is still handy to host those static files on App Engine. It's free and you don't need to get your own webspace. Here is how it works:

Deploying the editor on Google App Engine is easy. Make sure you have [ant](http://ant.apache.org/) and the Google App Engine Launcher included in the [Google App Engine SDK for Python](http://code.google.com/appengine/downloads.html) installed before you continue.
  1. Create a project on Google App Engine.
  1. Check out the source code.
  1. Modify the first line of "app.yaml" to point to your new App Engine project.
  1. Run "ant" on the command line in the source code directory to build the editor. This will create a folder named "appengine" in the parent directory.
  1. Upload this folder to App Engine using the "Google App Engine Launcher":
    1. Click on "File - Add existing application".
    1. Enter the path to the "appengine" folder. Click "Add".
    1. Click deploy and enter your Google user credentials.
  1. You can now embed the editor in a Google+ Hangout as explained [here](https://developers.google.com/+/hangouts/running). The URL for the Gadget XML file is `https://your-app-engine-project-name.appspot.com/gadget/oryx.xml`.

During development it can be useful to deploy the editor without "compiling" the JavaScript. To do that, follow all the steps outlined above, but do not run "ant". Instead of pointing the "Google App Engine Launcher" to the non-existend appeninge folder, point it to the folder containing the source code. The URL for the "uncompiled" Gadget XML file is `https://your-app-engine-project-name.appspot.com/gadget/oryx-dev.xml`.