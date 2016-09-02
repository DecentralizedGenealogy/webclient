# Steps to run
1. Install IPFS (https://ipfs.io/docs/install/)
2. run: ipfs init
3. Add CORS headers
	* ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
  * ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "GET", "POST"]'
  * ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials '["true"]'
4. Run: ipfs daemon
5. Go to http://localhost:5001/webui/

# File format options:
* https://en.wikipedia.org/wiki/JSON-LD