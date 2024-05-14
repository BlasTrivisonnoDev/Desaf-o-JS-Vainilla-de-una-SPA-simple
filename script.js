document.addEventListener("DOMContentLoaded", function() {
    const repoContainer = document.getElementById("repo-container");
    const apiUrl = "https://api.github.com/search/repositories?q=stars:%3E1&sort=stars&order=desc";

    let repoCount = 0; // Variable para llevar la cuenta del número de repositorios mostrados

    function fetchRepos(url) {
        fetch(url)
            .then(response => {
                const linkHeader = response.headers.get("Link");
                const nextPageUrl = getNextPageUrl(linkHeader);
                return Promise.all([response.json(), nextPageUrl]);
            })
            .then(([data, nextPageUrl]) => {
                data.items.forEach(repo => {
                    if (repoCount < 50) { // Limitar a 50 repositorios
                        const repoCard = document.createElement("div");
                        repoCard.classList.add("repo");
                        repoCount++; // Incrementa el contador de repositorios
                        repoCard.innerHTML = `
                            <h2>${repoCount}. <a href="${repo.html_url}" target="_blank">${repo.full_name}</a></h2>
                            <p><strong>Descripción:</strong> ${repo.description}</p>
                            <p><strong>Lenguaje:</strong> ${repo.language}</p>
                            <p><strong>Estrellas:</strong> ${repo.stargazers_count}</p>
                            <p><strong>Última actualización:</strong> ${new Date(repo.updated_at).toLocaleDateString()}</p>
                        `;
                        repoContainer.appendChild(repoCard);
                    }
                });

            
                if (nextPageUrl && repoCount < 50) {
                    fetchRepos(nextPageUrl);
                }
            })
            .catch(error => console.error("Error fetching repos:", error));
    }

    function getNextPageUrl(linkHeader) {
        if (!linkHeader) return null;
        const links = linkHeader.split(",");
        for (const link of links) {
            const [url, rel] = link.split(";");
            if (rel.trim() === 'rel="next"') {
                return url.trim().slice(1, -1);
            }
        }
        return null;
    }

    fetchRepos(apiUrl);
});
