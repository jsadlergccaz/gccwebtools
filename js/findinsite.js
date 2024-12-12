document.getElementById('runCrawler').addEventListener('click', async function() {
    // Get user inputs
    const baseUrl = document.getElementById('urlInput').value;
    const includeHtmlTag = document.getElementById('tagInput').value || null;
    const includeAttribute = document.getElementById('attributeInput').value || null;
    const includeAttributeValues = document.getElementById('attributeValuesInput').value.split(',');
    const excludeAttribute = document.getElementById('excludeAttributeInput').value || null;
    const excludeAttributeValues = document.getElementById('excludeAttributeValuesInput').value.split(',');

    // Fetch and initialize Pyodide
    await loadPyodide({ indexURL : 'https://cdn.jsdelivr.net/pyodide/v0.18.1/full/' });

    // Execute the Python script using Pyodide
    const result = pyodide.runPython(`
        import os
        import requests
        from bs4 import BeautifulSoup
        from urllib.parse import urljoin, urlparse, urldefrag
        from requests.exceptions import SSLError, HTTPError
        import csv
        from datetime import datetime

        def crawl_website(base_url, include_html_tag=None, include_attribute=None, include_attribute_values=None, exclude_attribute=None, exclude_attribute_values=None):
            visited_urls = set()
            results = []

            def recursive_crawl(url, parent_url=None):
                if url in visited_urls:
                    return

                try:
                    response = requests.get(url, allow_redirects=False)
                    response.raise_for_status()

                    visited_urls.add(url)

                    if response.is_redirect:
                        redirected_url = response.headers['Location']
                        redirected_url = urljoin(url, redirected_url)
                        redirected_url, _ = urldefrag(redirected_url)

                        if urlparse(redirected_url).netloc == urlparse(base_url).netloc:
                            recursive_crawl(redirected_url, parent_url=url)
                    else:
                        content_type = response.headers.get('Content-Type', '').lower()

                        if 'text/html' not in content_type:
                            results.append({'URL': url, 'Status': 'Skipped (Non-HTML)', 'Parent URL': parent_url})
                            return

                        try:
                            soup = BeautifulSoup(response.text, 'html.parser')
                        except Exception:
                            soup = BeautifulSoup(response.text, 'html5lib')

                        if include_html_tag or include_attribute:
                            elements = soup.find_all(include_html_tag, attrs={include_attribute: True}) if include_html_tag and include_attribute else soup.find_all(attrs={include_attribute: True}) if include_attribute else []
                            excluded_elements = soup.find_all(include_html_tag, {exclude_attribute: exclude_attribute_values}) if exclude_attribute else []

                            if elements and not any(elem in elements for elem in excluded_elements):
                                results.append({'URL': url, 'Matched Elements': elements, 'Status': 'Success', 'Parent URL': parent_url})

                        for link in soup.find_all('a', href=True):
                            next_url = urljoin(url, link['href'])
                            next_url, _ = urldefrag(next_url)

                            if urlparse(next_url).netloc == urlparse(base_url).netloc:
                                recursive_crawl(next_url, parent_url=url)

                except SSLError as ssl_error:
                    results.append({'URL': url, 'Status': f'Error (SSL): {ssl_error}', 'Parent URL': parent_url})

                except HTTPError as http_error:
                    results.append({'URL': url, 'Status': f'Error (HTTP): {http_error}', 'Parent URL': parent_url})

                except requests.RequestException as e:
                    results.append({'URL': url, 'Status': f'Error: {e}', 'Parent URL': parent_url})

            recursive_crawl(base_url)

            result_str = ""
            for result in results:
                result_str += f"URL: {result['URL']}\n"
                result_str += f"Status: {result['Status']}\n"
                result_str += f"Parent URL: {result['Parent URL']}\n"
                result_str += f"Matched Elements: {result.get('Matched Elements', [])}\n\n"

            return result_str

        crawl_website(
            base_url="${baseUrl}",
            include_html_tag="${includeHtmlTag}",
            include_attribute="${includeAttribute}",
            include_attribute_values=${JSON.stringify(includeAttributeValues)},
            exclude_attribute="${excludeAttribute}",
            exclude_attribute_values=${JSON.stringify(excludeAttributeValues)}
        )
    `);

    // Display the output on the web page
    document.getElementById('output').value = result;
});
