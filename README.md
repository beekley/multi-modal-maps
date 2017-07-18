# multi-modal-maps

Right now, Google Maps does not provide directions that use multiple modes of transportation (e.g. biking and public transit). This project uses Node.js and the Google Maps APIs to serve an app that allows the user to search for directions that combine biking and public transit.

[Demo](http://m3.beekley.xyz/)

## To Do List

- [ ] Provide written directions
- [ ] Allow user to bring their own API key (it's easy to hit the free-tier query limits)
- [ ] Arbitrary modes of transportation (e.g. Driving + Transit)

## Installation

Clone this repository and install the dependencies:
```
npm install
```
Create a file named `secrets.js` in the root of the installation directory. This will contain the API key for the Google Maps APIs and has the following format:
```
module.exports = {
  gmapkey: 'YOUR KEY HERE'
}
```
You can get a free API key from Google [here](https://console.developers.google.com/). The key needs the 'Google Maps JavaScript API' and 'Google Maps Directions API' enabled. Since the key is visible to the client, it's strongly recommended to restrict the key to your domain (configurable on the Google Developer's Console).
