# The Case for a Decentralized Distributed Genealogical Tree

Commercial desktop and cloud based tree managers are using technology as old and antiquated as the ancestors we are researching. With the size and scope of problems this industry has to solve, we can’t afford self-imposed technology hurdles to slow us down. Evolutionary changes have given us progress in a linear fashion. However, it’s time to make revolutionary changes that will result in exponential efficiencies and thereby reduce the manual tedium and burden placed upon the user.

The current status quo leaves us dealing with the the following inadequacies.
- Genealogical data is owned and controlled by commercial entities, not the user community.
- Genealogical data is held hostage by vendor lock-in using proprietary formats and standards.
- Commercial entities entice users to copy their tree to their site to take advantage of their unique services. This causes the user unneeded overhead, syncing changes between multiple trees that eventually lead to exhaustion and stagnant orphaned trees littering the landscape. We need to leave the data where it resides, in the hands of the best steward.
- Users have very limited means to move, copy and share their tree data. The tools used to export and import are lossy (GEDCOM 5.5), or stuck behind proprietary APIs putting the data out of reach for the common user.
- Whatever tree data that does make it out of its isolated silo becomes stale and un-maintained as users move on and abandon the data.
- Users are forced to maintain multiple personal trees--resulting in a very high duplication rate, causing noise and confusion.

It’s time to regain control of our genealogical data. We can’t rely on commercial entities to make these changes, they have their own fiduciary responsibilities to attend to. Central planning in commercial silos will not get us there. Commercial ventures need to be on as equal footing as the user community. The community needs to take ownership of their data as well as the responsibility to determine their own destiny. This is best achieved in a self-organized, open and decentralized way.

Don’t despair, Implementing a decentralized system of this type is not unprecedented. It’s been done with Bitcoin, Wikipedia, the Internet, the Free Market, and even in hymenoptera insects such as ants and bees (Did you know queen ants have no authority or control of the colony. The queen’s role is to reproduce).

The revolutionary liberation of genealogical data will lead to further advancements in the field of family history research. The user community, freed from the shackles of proprietary formats, will flourish in remarkable ways through:

- Alternate Hypothetical Parallel Personas
- Evolving Persona Versioning & Tracking 
- PubSub Self-Updating Search Indexes
- Rapid Beginner Tree Discovery Experiences
- Peer to Peer Change Request Processes 
- Community Arbitration with Satisfying Disagreements
- Permissionless Innovation & Shared Economy

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

# Looking for volunteers to create:
* A search engine utilizing github webhooks to update the search index.
* Web, mobile, and electron clients
* Tree hosting service (gitlab might be a good start)

# To run HTML client
1. Go here: https://misbach.github.io/DecentralizedDistributedGenealogy/webclient/index.html

OR

1. `npm install http-server`
2. `http-server -p 5000 webclient`
3. `http://localhost:5000/`
