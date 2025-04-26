// pages/aid-requests.tsx
'use client';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { ethers } from 'ethers';
import { getAllAidRequests, getFarmerDetails, fundAidRequest, truncateAddress} from '@/lib/blockchain';

export default function AllAidRequestsPage({ contract }: { contract: any }) {
  // State for aid requests
  const [aidRequests, setAidRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [farmerInfo, setFarmerInfo] = useState<{ [key: string]: any }>({});
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [fundAmount, setFundAmount] = useState('');
  const [fundingLoading, setFundingLoading] = useState(false);
  const [fundingSuccess, setFundingSuccess] = useState('');
  const [fundingError, setFundingError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'fulfilled'

  // Fetch all aid requests when component mounts
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const requests = await getAllAidRequests();
        setAidRequests(requests);
        
        // Apply initial filtering
        applyFilter(requests, filter);
        
        // Fetch farmer details for each unique farmer
        const uniqueFarmers = Array.from(new Set(requests.map((req: { farmer: string }) => req.farmer)));
        const farmersInfo: { [key: string]: any } = {};
        
        for (const farmerAddress of uniqueFarmers as string[]) {
          const details = await getFarmerDetails(farmerAddress);
          if (details) {
            farmersInfo[farmerAddress] = details;
          }
        }
        
        setFarmerInfo(farmersInfo);
      } catch (err: any) {
        setError(err.message || "Failed to fetch aid requests");
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequests();
  }, []);
  
  // Apply filtering
  const applyFilter = (requests: any[], filterType: string) => {
    switch (filterType) {
      case 'active':
        setFilteredRequests(requests.filter(req => !req.fulfilled));
        break;
      case 'fulfilled':
        setFilteredRequests(requests.filter(req => req.fulfilled));
        break;
      default:
        setFilteredRequests(requests);
    }
  };
  
  // Handle filter change
  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    applyFilter(aidRequests, newFilter);
  };
  
  // Handle funding an aid request
  const handleFundRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    
    setFundingLoading(true);
    setFundingError('');
    setFundingSuccess('');
    
    try {
      // Convert the fund amount to wei for proper funding
      const amountInEth = ethers.parseEther(fundAmount);
      
      // Call the function with the correct value parameter
      await fundAidRequest(selectedRequest.id, fundAmount);
      
      setFundingSuccess(`Successfully funded ${fundAmount} ETH to aid request`);
      setFundAmount('');
      
      // Refresh the requests
      const requests = await getAllAidRequests();
      setAidRequests(requests);
      applyFilter(requests, filter);
      
      // Close the funding modal
      setSelectedRequest(null);
    } catch (err: any) {
      console.error("Funding error:", err);
      setFundingError(err.message || "Failed to fund aid request. Please make sure you have enough ETH and the request is still active.");
    } finally {
      setFundingLoading(false);
    }
  };
  
  // Format timestamp to readable date
  const formatDate = (timestamp: Date) => {
    return new Date(timestamp).toLocaleDateString() + ' ' + new Date(timestamp).toLocaleTimeString();
  };
  
  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>FairFund - All Aid Requests</title>
        <meta name="description" content="View and fund agricultural aid requests on the FairFund platform" />
      </Head>
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-green-700 mb-6 text-center">Agricultural Aid Requests</h1>
          
          {/* Filter tabs */}
          <div className="flex space-x-2 mb-6">
            <button 
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-2 rounded-md ${filter === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              All Requests
            </button>
            <button 
              onClick={() => handleFilterChange('active')}
              className={`px-4 py-2 rounded-md ${filter === 'active' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Active Requests
            </button>
            <button 
              onClick={() => handleFilterChange('fulfilled')}
              className={`px-4 py-2 rounded-md ${filter === 'fulfilled' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Fulfilled Requests
            </button>
          </div>
          
          {/* Loading and error states */}
          {loading && (
            <div className="text-center py-10">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
              <p className="mt-2 text-gray-600">Loading aid requests...</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          {/* Aid requests table */}
          {!loading && filteredRequests.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500">No aid requests found</p>
            </div>
          )}
          
          {!loading && filteredRequests.length > 0 && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{request.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{request.purpose}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {farmerInfo[request.farmer]?.name || truncateAddress(request.farmer)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {farmerInfo[request.farmer]?.location || ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{request.amountRequested} ETH</div>
                          <div className="text-xs text-gray-500">
                            Funded: {request.amountFunded} ETH
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(request.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {request.fulfilled ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Fulfilled
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {!request.fulfilled && (
                            <button
                              onClick={() => setSelectedRequest(request)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Fund
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Funding Modal */}
          {selectedRequest && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-10">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-bold mb-4">Fund Aid Request</h2>
                
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700">Request:</p>
                  <p className="font-semibold">{selectedRequest.name}</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700">Farmer:</p>
                  <p>{farmerInfo[selectedRequest.farmer]?.name || truncateAddress(selectedRequest.farmer)}</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700">Requested Amount:</p>
                  <p>{selectedRequest.amountRequested} ETH</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700">Already Funded:</p>
                  <p>{selectedRequest.amountFunded} ETH</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700">Remaining Amount:</p>
                  <p>{parseFloat(selectedRequest.amountRequested) - parseFloat(selectedRequest.amountFunded)} ETH</p>
                </div>
                
                {fundingError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4">
                    <p className="text-sm text-red-700">{fundingError}</p>
                  </div>
                )}
                
                {fundingSuccess && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-3 mb-4">
                    <p className="text-sm text-green-700">{fundingSuccess}</p>
                  </div>
                )}
                
                <form onSubmit={handleFundRequest}>
                  <div className="mb-4">
                    <label htmlFor="fundAmount" className="block text-sm font-medium text-gray-700 mb-1">
                      Amount to Fund (ETH)
                    </label>
                    <input
                      type="number"
                      id="fundAmount"
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                      step="0.01"
                      min="0.01"
                      max={parseFloat(selectedRequest.amountRequested) - parseFloat(selectedRequest.amountFunded)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter an amount up to the remaining needed amount.
                    </p>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRequest(null)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={fundingLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {fundingLoading ? 'Processing...' : 'Fund'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}