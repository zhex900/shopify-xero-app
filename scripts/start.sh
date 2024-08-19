

# Function to escape special characters in a string
escape_special_characters() {
    local input="$1"
    local escaped=""

    # Loop through each character in the input string
    for (( i=0; i<${#input}; i++ )); do
        char="${input:$i:1}"
        case "$char" in
            [a-zA-Z0-9.~_-])
                # Safe characters
                escaped+="$char"
                ;;
            *)
                # Unsafe characters
                printf -v hex '%02X' "'$char"
                escaped+="\\x$hex"
                ;;
        esac
    done

    echo "$escaped"
}


url="https://d3alyhq6sarjuz.cloudfront.net"

original_url="https://example.com/path/to/resource?query=param&other=param#fragment"
escaped_url=$(escape_special_characters "$original_url")

echo "Original URL: $original_url"
echo "Escaped URL: $escaped_url"

echo "URL: $url"
escaped_url_for_sed=$(echo "$url" | sed 's/[\/&]/\\&/g')
sed -i -e "s/http.*:\/\/.*\.[a-z]*/$escaped_url_for_sed/g" ./shopify.app.toml


cat ./shopify.app.toml
