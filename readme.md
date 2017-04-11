# GEDCOM X spec
https://github.com/FamilySearch/gedcomx/blob/master/specifications/file-format-specification.md
https://github.com/FamilySearch/gedcomx/blob/master/specifications/json-format-specification.md

# Looking for volunteers to create:
* A search engine utilizing github webhooks to update the search index.
* A web and/or electron client
* A tree hosting service (gitlab might be a good start)


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
