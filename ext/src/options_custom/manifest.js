// SAMPLE
this.manifest = {
    "name": "Tiled Boxes",
    "icon": "icon.png",
    "settings": [
        {
            "tab": i18n.get("connection"),
            "group": i18n.get("connection"),
            "name": "connection-host",
            "type": "text",
            "label": i18n.get("host"),
            "text": "localhost"
        },
        {
            "tab": i18n.get("connection"),
            "group": i18n.get("connection"),
            "name": "connection-port",
            "type": "text",
            "label": i18n.get("port"),
            "text": "7348"
        },
        {
            "tab": i18n.get("connection"),
            "group": i18n.get("connection"),
            "name": "connection-description",
            "type": "description",
            "text": i18n.get("connection-description")
        }
    ],
    "alignment": [
        [
            "connection-host",
            "connection-port"
        ]
    ]
};
