import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function FormFields() {
  const [releaseDateType, setReleaseDateType] = useState<'asap' | 'specific'>('asap');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [hasVinylRelease, setHasVinylRelease] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Real-time validation states
  const [email, setEmail] = useState('');
  const [digitalPrice, setDigitalPrice] = useState('');
  const [vinylPrice, setVinylPrice] = useState('');
  const [artistName, setArtistName] = useState('');

  const handleDateSelect = (date: Date | null) => {
    setSelectedDate(date);
    setShowCalendar(false);
  };

  // Email validation
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Price validation
  const isValidPrice = (price: string) => {
    return /^\d+(\.\d{1,2})?$/.test(price) && parseFloat(price) > 0;
  };

  return (
    <>
      <div className="border-b border-gray-200 pb-8">
        <h2 className="text-lg text-gray-900 font-semibold mb-6">
          Artist Information
        </h2>
        
        <div className="space-y-5">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Artist / Producer Name *
            </label>
            <div className="relative">
              <input
                type="text"
                id="artistName"
                name="artistName"
                required
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder=""
                className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all pr-10 ${
                  artistName.length > 0
                    ? 'border-green-300 focus:ring-green-500 focus:border-transparent'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                }`}
              />
              {artistName.length > 0 && (
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              )}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Label Name
            </label>
            <input
              type="text"
              id="labelName"
              name="labelName"
              placeholder=""
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=""
                className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all pr-10 ${
                  email.length === 0
                    ? 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                    : isValidEmail(email)
                    ? 'border-green-300 focus:ring-green-500 focus:border-transparent'
                    : 'border-red-300 focus:ring-red-500 focus:border-transparent'
                }`}
              />
              {email.length > 0 && (
                isValidEmail(email) ? (
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                ) : (
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                  </svg>
                )
              )}
            </div>
            {email.length > 0 && !isValidEmail(email) && (
              <p className="mt-1 text-xs text-red-600">Please enter a valid email address</p>
            )}
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 pb-8">
        <h2 className="text-lg text-gray-900 font-semibold mb-6">
          Release Details
        </h2>
        
        <div className="space-y-5">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Release Title *
            </label>
            <input
              type="text"
              id="releaseName"
              name="releaseName"
              required
              placeholder=""
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Track Listing
            </label>
            <textarea
              id="trackListing"
              name="trackListing"
              rows={5}
              placeholder=""
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none font-mono text-sm"
            />
            <p className="mt-2 text-xs text-gray-500">Include any other artists in the track listing.</p>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Genre
            </label>
            <select 
              id="genre" 
              name="genre"
              defaultValue="jungle"
              onChange={(e) => {
                const container = document.getElementById('customGenreContainer');
                const customInput = document.getElementById('customGenre') as HTMLInputElement;
                if (e.target.value === 'custom') {
                  container?.classList.remove('hidden');
                  customInput?.focus();
                } else {
                  container?.classList.add('hidden');
                }
              }}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="jungle">Jungle</option>
              <option value="dnb">Drum & Bass</option>
              <option value="custom">Other (specify)</option>
            </select>
          </div>

          <div id="customGenreContainer" className="hidden">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Specify Genre
            </label>
            <input
              type="text"
              id="customGenre"
              name="customGenre"
              placeholder=""
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Release Date Section */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-3">
              Preferred Release Date *
            </label>
            
            {/* Radio Buttons */}
            <div className="space-y-3 mb-4">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="radio"
                  name="releaseDateType"
                  value="asap"
                  checked={releaseDateType === 'asap'}
                  onChange={() => setReleaseDateType('asap')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-700 group-hover:text-gray-900">As Soon As Possible</span>
              </label>

              <label className="flex items-center cursor-pointer group">
                <input
                  type="radio"
                  name="releaseDateType"
                  value="specific"
                  checked={releaseDateType === 'specific'}
                  onChange={() => setReleaseDateType('specific')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-700 group-hover:text-gray-900">Specific Date</span>
              </label>
            </div>

            {/* Date Selection Button */}
            {releaseDateType === 'specific' && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setShowCalendar(true)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-left text-gray-900 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all flex items-center justify-between"
                >
                  <span className={selectedDate ? 'text-gray-900' : 'text-gray-400'}>
                    {selectedDate ? selectedDate.toLocaleDateString('en-GB', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'Click to select date'}
                  </span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </button>
                
                {/* Hidden input to store the date */}
                <input 
                  type="hidden" 
                  id="releaseDate" 
                  name="releaseDate" 
                  value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''} 
                />
                
                {/* Helpful tip for Fridays */}
                {selectedDate && selectedDate.getDay() === 5 && (
                  <p className="mt-2 text-xs text-green-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    Friday is a popular release day!
                  </p>
                )}
              </div>
            )}

            {/* Hidden input to store the type */}
            <input type="hidden" name="releaseDateType" value={releaseDateType} />
          </div>

          {/* Vinyl Release Section */}
          <div className="border-t border-gray-200 pt-6">
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                id="vinylRelease"
                name="vinylRelease"
                checked={hasVinylRelease}
                onChange={(e) => setHasVinylRelease(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-3 text-gray-700 font-medium group-hover:text-gray-900">
                Vinyl Release Available
              </span>
            </label>
          </div>

          {/* Vinyl Price - Only shown if vinyl is selected */}
          {hasVinylRelease && (
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Vinyl Price Per Sale (£) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">£</span>
                <input
                  type="text"
                  id="vinylPrice"
                  name="vinylPrice"
                  required={hasVinylRelease}
                  value={vinylPrice}
                  onChange={(e) => setVinylPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="0.00"
                  className={`w-full pl-8 pr-10 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                    vinylPrice.length === 0
                      ? 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                      : isValidPrice(vinylPrice)
                      ? 'border-green-300 focus:ring-green-500 focus:border-transparent'
                      : 'border-red-300 focus:ring-red-500 focus:border-transparent'
                  }`}
                />
                {vinylPrice.length > 0 && (
                  isValidPrice(vinylPrice) ? (
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                  ) : (
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                    </svg>
                  )
                )}
              </div>
              {vinylPrice.length > 0 && !isValidPrice(vinylPrice) && (
                <p className="mt-1 text-xs text-red-600">Enter a valid price </p>
              )}
              <p className="mt-2 text-xs text-gray-500">Enter the price for your vinyl release</p>
            </div>
          )}

          {/* Price Per Sale */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Digital Price Per Sale (£) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">£</span>
              <input
                type="text"
                id="pricePerSale"
                name="pricePerSale"
                required
                value={digitalPrice}
                onChange={(e) => setDigitalPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="0.00"
                className={`w-full pl-8 pr-10 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                  digitalPrice.length === 0
                    ? 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                    : isValidPrice(digitalPrice)
                    ? 'border-green-300 focus:ring-green-500 focus:border-transparent'
                    : 'border-red-300 focus:ring-red-500 focus:border-transparent'
                }`}
              />
              {digitalPrice.length > 0 && (
                isValidPrice(digitalPrice) ? (
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                ) : (
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                  </svg>
                )
              )}
            </div>
            {digitalPrice.length > 0 && !isValidPrice(digitalPrice) && (
              <p className="mt-1 text-xs text-red-600">Enter a valid price (e.g., 5.00)</p>
            )}
            <p className="mt-2 text-xs text-gray-500">Enter the price for your digital release</p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-gray-700 text-sm font-medium mb-2">
          Additional Notes (Optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          placeholder=""
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
        />
      </div>

      {/* Calendar Modal */}
      {showCalendar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Select Release Date</h3>
              <button
                type="button"
                onClick={() => setShowCalendar(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <div className="flex justify-center">
              <DatePicker
                selected={selectedDate}
                onChange={handleDateSelect}
                minDate={new Date()}
                inline
                calendarClassName="custom-calendar"
                filterDate={(date) => {
                  // Highlight Fridays
                  return true;
                }}
                dayClassName={(date) => {
                  return date.getDay() === 5 ? 'friday-highlight' : undefined;
                }}
              />
            </div>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setShowCalendar(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => selectedDate && handleDateSelect(selectedDate)}
                disabled={!selectedDate}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Calendar Styles */}
      <style>{`
        .custom-calendar {
          font-family: inherit;
          border: none;
        }
        .react-datepicker {
          border: none;
          font-family: inherit;
        }
        .react-datepicker__header {
          background-color: #eff6ff;
          border-bottom: 1px solid #e5e7eb;
          border-radius: 0.5rem 0.5rem 0 0;
          padding-top: 0.75rem;
        }
        .react-datepicker__current-month {
          color: #1f2937;
          font-weight: 600;
          font-size: 1rem;
        }
        .react-datepicker__day-name {
          color: #6b7280;
          font-weight: 500;
          width: 2.5rem;
          line-height: 2.5rem;
        }
        .react-datepicker__day {
          width: 2.5rem;
          line-height: 2.5rem;
          color: #374151;
          border-radius: 0.5rem;
        }
        .react-datepicker__day:hover {
          background-color: #eff6ff;
          border-radius: 0.5rem;
        }
        .react-datepicker__day--selected {
          background-color: #2563eb;
          color: white;
          border-radius: 0.5rem;
        }
        .react-datepicker__day--selected:hover {
          background-color: #1d4ed8;
        }
        .react-datepicker__day--disabled {
          color: #d1d5db;
          cursor: not-allowed;
        }
        .react-datepicker__day--disabled:hover {
          background-color: transparent;
        }
        .react-datepicker__day--today {
          font-weight: 600;
          color: #2563eb;
        }
        .friday-highlight {
          font-weight: 600;
          background-color: #dbeafe;
        }
      `}</style>
    </>
  );
}