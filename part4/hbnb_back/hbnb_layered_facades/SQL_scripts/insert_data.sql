USE development;

INSERT INTO users (id, email, first_name, last_name, password, is_admin)
    VALUES ('36c9050e-ddd3-4c3b-9731-9f487208bbc1', 'admin@hbnb.io', 'Admin',
    'HBnB', '$2b$12$rxBJzT4WIFSdoN/KJtSzS.FjvrYA4bX8BDGr0KXQKnpWA/5/xRsv6', TRUE);

INSERT INTO amenities (id, name)
    VALUES ('3d62d56b-3641-4dbd-9050-66f9faf7db9f', 'Wifi'),
    ('e086770e-f72b-40ff-950a-c192fb69442c', 'Swimming Pool'),
    ('9488f29f-f553-4579-bbd6-00435daf2169', 'Air Conditioning');
