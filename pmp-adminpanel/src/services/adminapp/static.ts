import network from '@/utils/network';


const contactService = (userData: {fname: string;lname: string; email: string; phone: string; message: string }) => {
  return network.post(`contact`, userData);
};


const planService = () => {
  return network.get(`subscriptions/list`, {});
};
// /

const subscriptions = (userData: {landlord_id: string; subscription_id: string; holding_properties: number }) => {
  return network.post(`subscriptions/subscribed-landlords/${userData.landlord_id}`, userData);
};




export default {
  contactService,
  planService,
  subscriptions


};
