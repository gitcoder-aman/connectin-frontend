import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Server, CheckCircle2, ShieldAlert, Cpu, Database, Network } from 'lucide-react';
import { apiClient } from '@/api/client';

interface BackendStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackendStatusModal: React.FC<BackendStatusModalProps> = ({ isOpen, onClose }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [gatewayStatus, setGatewayStatus] = useState<'idle' | 'online' | 'unreachable'>('idle');

  const checkConnectivity = async () => {
    setIsChecking(true);
    try {
      // Test public endpoint or health check
      await apiClient.get('/actuator/health', { timeout: 4000 });
      setGatewayStatus('online');
    } catch (err: any) {
      if (err?.response) {
        // If the server answered with any HTTP status (even 404 or 401), the Gateway is online!
        setGatewayStatus('online');
      } else {
        setGatewayStatus('unreachable');
      }
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ConnectIn Production Microservices Architecture"
      maxWidth="2xl"
    >
      <div className="space-y-5 text-xs sm:text-sm text-slate-700 max-h-[75vh] overflow-y-auto pr-1">
        {/* Production Host Banner */}
        <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
              Production Gateway Host (GKE)
            </div>
            <div className="font-mono text-sm text-brand-400">
              {import.meta.env.VITE_API_BASE_URL || 'https://34.95.113.61.sslip.io'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={checkConnectivity}
              disabled={isChecking}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors border border-slate-700"
            >
              {isChecking ? 'Probing...' : 'Test Connection'}
            </button>
            {gatewayStatus === 'online' && (
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" /> Gateway Reachable
              </span>
            )}
            {gatewayStatus === 'unreachable' && (
              <span className="flex items-center gap-1 text-xs text-rose-400 font-semibold">
                <ShieldAlert className="w-4 h-4" /> Offline / CORS Filtered
              </span>
            )}
          </div>
        </div>

        {/* Microservices Topology Overview */}
        <div>
          <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-brand-600" />
            Backend Microservices & Databases
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="font-semibold text-slate-900 flex items-center gap-1">
                <Server className="w-3.5 h-3.5 text-blue-500" /> API Gateway (:8080 / port 80)
              </div>
              <p className="text-slate-500 mt-1">
                Spring Cloud Gateway MVC, Ingress entrypoint, JWT AuthenticationFilter, CORS registry.
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="font-semibold text-slate-900 flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-indigo-500" /> User Service (:9020)
              </div>
              <p className="text-slate-500 mt-1">
                PostgreSQL (usersDB). Handles /auth/signup & /auth/login. Emits user_created_topic.
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="font-semibold text-slate-900 flex items-center gap-1">
                <Network className="w-3.5 h-3.5 text-emerald-500" /> Connection Service (:9030)
              </div>
              <p className="text-slate-500 mt-1">
                Neo4j Graph DB. Manages network nodes, 1st degree links, sent & received requests.
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="font-semibold text-slate-900 flex items-center gap-1">
                <Server className="w-3.5 h-3.5 text-amber-500" /> Post Service (:9010)
              </div>
              <p className="text-slate-500 mt-1">
                PostgreSQL (postsDB). Post creation, feed posts by user, like/unlike endpoints.
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="font-semibold text-slate-900 flex items-center gap-1">
                <Server className="w-3.5 h-3.5 text-purple-500" /> Uploader Service (:9050)
              </div>
              <p className="text-slate-500 mt-1">
                Cloudinary cloud uploader. Invoked internally by post-service via OpenFeign.
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="font-semibold text-slate-900 flex items-center gap-1">
                <Server className="w-3.5 h-3.5 text-rose-500" /> Notification Service (:9040)
              </div>
              <p className="text-slate-500 mt-1">
                Asynchronous Kafka consumer. Consumes post_created_topic and post_liked_topic.
              </p>
            </div>
          </div>
        </div>

        {/* Real Backend Endpoints Mapping Table */}
        <div>
          <h4 className="font-bold text-slate-900 mb-2">Verified REST API Endpoints</h4>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2">Method</th>
                  <th className="p-2">Gateway Endpoint</th>
                  <th className="p-2">Auth</th>
                  <th className="p-2">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                <tr>
                  <td className="p-2 text-emerald-600 font-bold">POST</td>
                  <td className="p-2">/api/v1/users/auth/signup</td>
                  <td className="p-2 text-slate-500 font-sans">Public</td>
                  <td className="p-2 font-sans">Register new account (name, email, password)</td>
                </tr>
                <tr>
                  <td className="p-2 text-emerald-600 font-bold">POST</td>
                  <td className="p-2">/api/v1/users/auth/login</td>
                  <td className="p-2 text-slate-500 font-sans">Public</td>
                  <td className="p-2 font-sans">Sign in, returns userEmail & accessToken</td>
                </tr>
                <tr>
                  <td className="p-2 text-blue-600 font-bold">GET</td>
                  <td className="p-2">/api/v1/connections/core/all</td>
                  <td className="p-2 text-amber-600 font-sans">JWT + X-User-Id</td>
                  <td className="p-2 font-sans">List all registered users in the network</td>
                </tr>
                <tr>
                  <td className="p-2 text-blue-600 font-bold">GET</td>
                  <td className="p-2">/api/v1/connections/core/&#123;userId&#125;/first-degree</td>
                  <td className="p-2 text-amber-600 font-sans">JWT + X-User-Id</td>
                  <td className="p-2 font-sans">Get 1st degree connections for user</td>
                </tr>
                <tr>
                  <td className="p-2 text-blue-600 font-bold">GET</td>
                  <td className="p-2">/api/v1/connections/core/requests/sent</td>
                  <td className="p-2 text-amber-600 font-sans">JWT + X-User-Id</td>
                  <td className="p-2 font-sans">Pending requests sent by user</td>
                </tr>
                <tr>
                  <td className="p-2 text-blue-600 font-bold">GET</td>
                  <td className="p-2">/api/v1/connections/core/requests/received</td>
                  <td className="p-2 text-amber-600 font-sans">JWT + X-User-Id</td>
                  <td className="p-2 font-sans">Pending invitations received by user</td>
                </tr>
                <tr>
                  <td className="p-2 text-emerald-600 font-bold">POST</td>
                  <td className="p-2">/api/v1/connections/core/request/&#123;userId&#125;</td>
                  <td className="p-2 text-amber-600 font-sans">JWT + X-User-Id</td>
                  <td className="p-2 font-sans">Send connection request</td>
                </tr>
                <tr>
                  <td className="p-2 text-emerald-600 font-bold">POST</td>
                  <td className="p-2">/api/v1/connections/core/accept/&#123;senderId&#125;</td>
                  <td className="p-2 text-amber-600 font-sans">JWT + X-User-Id</td>
                  <td className="p-2 font-sans">Accept connection request</td>
                </tr>
                <tr>
                  <td className="p-2 text-emerald-600 font-bold">POST</td>
                  <td className="p-2">/api/v1/connections/core/reject/&#123;senderId&#125;</td>
                  <td className="p-2 text-amber-600 font-sans">JWT + X-User-Id</td>
                  <td className="p-2 font-sans">Reject connection request</td>
                </tr>
                <tr>
                  <td className="p-2 text-rose-600 font-bold">DELETE</td>
                  <td className="p-2">/api/v1/connections/core/remove/&#123;userId&#125;</td>
                  <td className="p-2 text-amber-600 font-sans">JWT + X-User-Id</td>
                  <td className="p-2 font-sans">Remove connection between users</td>
                </tr>
                <tr>
                  <td className="p-2 text-blue-600 font-bold">GET</td>
                  <td className="p-2">/api/v1/posts/core/all</td>
                  <td className="p-2 text-amber-600 font-sans">JWT + X-User-Id</td>
                  <td className="p-2 font-sans">Get all community posts across platform</td>
                </tr>
                <tr>
                  <td className="p-2 text-emerald-600 font-bold">POST</td>
                  <td className="p-2">/api/v1/posts/core</td>
                  <td className="p-2 text-amber-600 font-sans">JWT + X-User-Id</td>
                  <td className="p-2 font-sans">Create post (multipart: post JSON + file)</td>
                </tr>
                <tr>
                  <td className="p-2 text-blue-600 font-bold">GET</td>
                  <td className="p-2">/api/v1/posts/core/&#123;postId&#125;</td>
                  <td className="p-2 text-amber-600 font-sans">JWT + X-User-Id</td>
                  <td className="p-2 font-sans">Get single post by ID</td>
                </tr>
                <tr>
                  <td className="p-2 text-blue-600 font-bold">GET</td>
                  <td className="p-2">/api/v1/posts/core/users/&#123;userId&#125;/all-posts</td>
                  <td className="p-2 text-amber-600 font-sans">JWT + X-User-Id</td>
                  <td className="p-2 font-sans">Get all posts created by user</td>
                </tr>
                <tr>
                  <td className="p-2 text-emerald-600 font-bold">POST</td>
                  <td className="p-2">/api/v1/posts/likes/&#123;postId&#125;</td>
                  <td className="p-2 text-amber-600 font-sans">JWT + X-User-Id</td>
                  <td className="p-2 font-sans">Like a post</td>
                </tr>
                <tr>
                  <td className="p-2 text-rose-600 font-bold">DELETE</td>
                  <td className="p-2">/api/v1/posts/likes/&#123;postId&#125;</td>
                  <td className="p-2 text-amber-600 font-sans">JWT + X-User-Id</td>
                  <td className="p-2 font-sans">Unlike a post</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Documented Limitations */}
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
          <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            Documented Backend Boundaries
          </h4>
          <ul className="list-disc pl-5 space-y-1 text-xs text-amber-800">
            <li>
              <strong>No Comments API:</strong> The backend does not implement comment tables or endpoints in `post-service`.
            </li>
            <li>
              <strong>No Notifications REST API:</strong> `notification-service` is an event-driven Kafka consumer without exposed REST controllers.
            </li>
            <li>
              <strong>No User Profile Update REST API:</strong> `user-service` manages auth records; additional custom bio/headline attributes are preserved locally.
            </li>
            <li>
              <strong>Unpaginated Responses:</strong> Backend endpoints return unpaginated arrays (`List&lt;Person&gt;`, `List&lt;PostDto&gt;`).
            </li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};
