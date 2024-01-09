# Harvey
Data Room Demo

Links:

(I didn't get a signed cert and implement TLS for this)
- ArgoCD (deployment view): http://argocd.greywind.services
  - Username: `viewer`
  - Password: `harveydemo`
- Dataroom Frontend: http://dataroom-frontend.greywind.services

- Notes
  - For some reason, I couldn't get the frontend app to communicate with the backend app on separate pods in the cluster,
    even though I checked the kube-dns was resolving and the environment variable `REACT_APP_API_BASE_URL` was there, it never
    seemed to want to work. On the chrome developer inspection panel I was oddly still seeing the request go for localhost:3000.
    I tried quite a few things, but no avail. Maybe something weird with the javascript app server code.


# Architecture

- Cloud machines: *Azure* (AKS, Kubernetes microservice deployment)
- Version control: *GitHub*
- IaC: *Terraform Cloud*
- CI: *CircleCI*
- CD: *ArgoCD*

Overall, the idea here was to bundle up the apps into their own docker images, push it to a container registry that a kubernetes cluster can pull from, and then deploy the services into pods. Used a load balancer via the application gateway ingress in a simplistic way to route the requests, bought a cheap domain name (greywind.services) to hook up to an Azure DNS. There are still a bunch of things lacking: no TLS cert right now, pretty wide open security groups as I ended up debugging the frontend/backend app interaction in the kube cluster more than anything; there's no WAF to protect the endpoints, there's no CDN served from regional POPs (e.g. Fastly) for faster app loading; there's no SAST/SCA on CI for the code scans; there's no persistent database layer implemented (although one could easily throw on an Azure DB of choice on the lonely, unused db-intended subnet); there's no central log monitoring; IAM via OIDC-injected Entra IDs isn't quite implemented as the apps don't have need of any Azure services at this point. But if backend needed, for instance, blob storage, I'd terraform a role for it and annotate a service account in Kubernetes for the backend service to be able to have that IAM role injected in its pods by AKS.

Scaling the app is relatively easy as you'd just increase node sizes, counts, and also deploy more replicas of the pods, but it'd be a distributed app at that point (and the app code has to account for distributed systems then).

Some thoughts on the services I used below:

## Azure
I never really utilized Azure *that* much, so this was kind of a fun challenge. AKS definitely has some hidden surprises that separates it from EKS on AWS, but not _too_ bad overall. The only pains were the free tier limitations (4 vCPU cores, 3 public IPs, a few other things seemed overly limiting for a free tier). Also just finding out the differences between AWS ALB and the application gateway ingress controller in Azure. AWS does make quite a few things easier, like TLS cert management via its ACM.

## GitHub
I know, there's Azure DevOps with its source control and all. But GitHub is GitHub.

## Terraform Cloud
Went with a free tier. Alternatives to this that I'd look into (even for my own company in the future) is Terrakube and OpenTofu + some sort of S3 backed remote storage. HashiCorp is price gouging these days, but it's still fairly reliable software.

## CircleCI
For as much as I hate their extortionist pricing, CircleCI makes it very fast to hook up a git repo and build/push images to container registries like AWS ECR and Azure ACR. I used the orbs that were out there already.

## ArgoCD
I really like the fast, simple nature of ArgoCD. It's pretty flexible too. The graphical view also helps quite a bit for me to see the state of all things, what's working and what's not.
