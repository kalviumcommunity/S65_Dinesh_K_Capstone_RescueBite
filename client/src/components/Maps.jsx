import React, { useEffect, useRef } from 'react';
import { mapsLoader } from '../lib/maps';

const Map = ({ donations, onMarkerClick, userLocation }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const initializeMap = () => {
      mapsLoader.load().then(() => {
        if (!isMounted || !mapRef.current) return;

        if (!mapInstanceRef.current) {
          // Set default location to Phagwara
          const defaultCenter = { lat: 31.224020, lng: 75.770798 };

          mapInstanceRef.current = new google.maps.Map(mapRef.current, {
            center: defaultCenter,
            zoom: 12,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'on' }],
              },
            ],
          });

          // Add a click event listener to place a red marker on user click
          mapInstanceRef.current.addListener('click', (event) => {
            if (!event.latLng) return;

            // Remove the previous user marker (if exists)
            if (userMarkerRef.current) {
              userMarkerRef.current.setMap(null);
            }

            // Create a new marker at the clicked position
            userMarkerRef.current = new google.maps.Marker({
              position: event.latLng,
              map: mapInstanceRef.current,
              title: 'Selected Location',
              icon: {
                url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
              },
            });
          });
        }

        // Clear existing markers
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        // Add donation markers
        donations.forEach(donation => {
          // Use coordinates from donation or generate random ones if not available
          const position = donation.coordinates ? 
            { lat: donation.coordinates.lat, lng: donation.coordinates.lng } :
            {
              lat: 31.224020 + (Math.random() - 0.5) * 0.01,
              lng: 75.770798 + (Math.random() - 0.5) * 0.01,
            };

          const marker = new google.maps.Marker({
            position,
            map: mapInstanceRef.current,
            title: donation.title || donation.restaurantName,
            animation: google.maps.Animation.DROP,
            icon: {
              url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
            },
          });

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div class="p-2">
                <h3 class="font-semibold">${donation.title || donation.restaurantName}</h3>
                <p>${donation.category || donation.foodType}</p>
                <p>${donation.description || ''}</p>
              </div>
            `,
          });

          marker.addListener('click', () => {
            infoWindow.open(mapInstanceRef.current, marker);
            if (onMarkerClick) onMarkerClick(donation);
          });

          markersRef.current.push(marker);
        });
      });
    };

    initializeMap();

    return () => {
      isMounted = false;
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
      }
    };
  }, [donations, onMarkerClick]);

  useEffect(() => {
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(userLocation);
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
      }
      userMarkerRef.current = new google.maps.Marker({
        position: userLocation,
        map: mapInstanceRef.current,
        title: 'Selected Location',
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
        },
      });
    }
  }, [userLocation]);

  useEffect(() => {
    mapsLoader.load().then(() => {
      if (searchInputRef.current) {
        const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
          types: ['geocode'],
          componentRestrictions: { country: 'in' }, // Restrict to India
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.geometry && mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(place.geometry.location);
            if (userMarkerRef.current) {
              userMarkerRef.current.setMap(null);
            }
            userMarkerRef.current = new google.maps.Marker({
              position: place.geometry.location,
              map: mapInstanceRef.current,
              title: 'Selected Location',
              icon: {
                url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
              },
            });
          }
        });
      }
    });
  }, [searchInputRef.current]);

  return (
    <div>
      <input
        ref={searchInputRef}
        type="text"
        placeholder="Search for a place..."
        className="px-4 py-2 rounded-md mb-4"
        style={{ width: '100%' }}
      />
      <div ref={mapRef} className="w-full h-full min-h-[400px] rounded-lg" />
    </div>
  );
};

export default Map;