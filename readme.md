# TODO:
* Create a search index

* github clones
- GitLab https://gitlab.com/gitlab-org/gitlab-ce/

# Tenets
	- No enforcement of referential integrity. The client could implement a soft version of ref integrity. If you remove a child from a parent, the child may still maintain relationship to parent.
	- No garuentee a relationship link won't become 404.
	- No central authority or control of the tree.
	- The tree is distributed geographically and authoritatively.
	- Each person or node in the tree is autonomous.
	- tree data is open and available to all.
	- Anyone can suggest (pull request) a change.
	- Everyone has freedom to fork a node if concensus is not met.
	- Combined with IPFS the nodes themselves also become decentralized and distributed.
	- Un-authenticated reading of tree. (The client could allow authentication for trees such as Ancestry, FamilySearch, etc.)

# To run HTML client
1. http-server -p 5000
2. go to: http://localhost:5000/webclient/


# File format options:
* https://en.wikipedia.org/wiki/JSON-LD
* gedcomx

# Steps to run IPFS
1. Install IPFS (https://ipfs.io/docs/install/)
2. run: ipfs init
3. Add CORS headers
	* ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
  * ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "GET", "POST"]'
  * ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials '["true"]'
4. Run: ipfs daemon
5. Go to http://localhost:5001/webui/
