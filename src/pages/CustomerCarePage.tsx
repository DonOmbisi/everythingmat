import React, { useState } from 'react';
import { Truck, RotateCcw, Shield, MessageCircle, Phone, Mail, MapPin, Clock } from 'lucide-react';

const CustomerCarePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('shipping');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: 'How do I determine my size during pregnancy?',
      answer: 'We recommend choosing your pre-pregnancy size. Our garments are designed to grow with you throughout your pregnancy. Each product page includes detailed size guides and measurements to help you make the best choice.'
    },
    {
      question: 'Can I wear Everything Maternity pieces after pregnancy?',
      answer: 'Many of our pieces are designed to be worn during and after pregnancy. Look for items marked as "nursing-friendly" which feature discreet access for breastfeeding, and our classic cuts that work beautifully post-pregnancy.'
    },
    {
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for unworn items in original condition with tags attached. Items must be returned in their original packaging. Please note that intimate apparel and swimwear are final sale for hygiene reasons.'
    },
    {
      question: 'Do you ship internationally?',
      answer: 'Yes, we ship worldwide. Shipping costs and delivery times vary by location. International orders may be subject to customs duties and taxes, which are the responsibility of the customer.'
    },
    {
      question: 'How should I care for my Everything Maternity garments?',
      answer: 'Care instructions are specific to each garment and can be found on the product page and care label. Generally, we recommend gentle washing in cold water and laying flat to dry to maintain the quality and longevity of your pieces.'
    },
    {
      question: 'Do you offer alterations?',
      answer: 'While we don\'t offer alteration services directly, our customer service team can recommend trusted tailors in major cities who are familiar with maternity wear and Everything Maternity garments.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-beige-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-serif text-black mb-4">Customer Care</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're here to help you with any questions about your Everything Maternity experience.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1">
            <div className="bg-sage-50 rounded-lg p-8 space-y-6">
              <h2 className="text-2xl font-serif text-black mb-6">Get in Touch</h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-sage-600 mt-1" />
                  <div>
                    <p className="font-medium text-black">Phone</p>
                    <p className="text-gray-600">0710 464342</p>
                    <p className="text-sm text-gray-500">Mon-Fri 9am-6pm EAT</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-sage-600 mt-1" />
                  <div>
                    <p className="font-medium text-black">Email</p>
                    <p className="text-gray-600">info@everythingmaternity.co.ke</p>
                    <p className="text-sm text-gray-500">Response within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MessageCircle className="h-5 w-5 text-sage-600 mt-1" />
                  <div>
                    <p className="font-medium text-black">Live Chat</p>
                    <p className="text-gray-600">Available on our website</p>
                    <p className="text-sm text-gray-500">Mon-Fri 9am-6pm EAT</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-sage-600 mt-1" />
                  <div>
                    <p className="font-medium text-black">Store Location</p>
                    <p className="text-gray-800 font-semibold">HISON PLAZA (next to Rafiki Bank)</p>
                    <p className="text-gray-800 font-semibold">3rd Floor Biashara street</p>
                    <p className="text-gray-800 font-semibold mb-2">Nairobi, Kenya</p>
                    <div className="rounded-lg overflow-hidden border border-sage-200 shadow mt-2">
                      <iframe
                        title="Store Location Map"
                        src="https://www.google.com/maps?q=HISON+PLAZA,+Biashara+Street,+Nairobi&output=embed"
                        width="100%"
                        height="200"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      ></iframe>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-sage-200">
                <div className="flex items-center space-x-2 mb-3">
                  <Clock className="h-4 w-4 text-sage-600" />
                  <span className="font-medium text-black">Store Hours</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Monday - Saturday: 9am - 6pm</p>
                  <p>Sunday: 12pm - 5pm</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-8">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'shipping', label: 'Shipping & Delivery', icon: Truck },
                  { id: 'returns', label: 'Returns & Exchanges', icon: RotateCcw },
                  { id: 'care', label: 'Care Instructions', icon: Shield }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-black text-black'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {activeTab === 'shipping' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-black mb-4">Shipping Options</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="border border-gray-200 rounded-lg p-6">
                        <h4 className="font-medium text-black mb-3">Standard Delivery</h4>
                        <ul className="space-y-2 text-gray-600">
                          <li>• 2-3 business days</li>
                          <li>• KES 500 shipping fee</li>
                          <li>• Free on orders over KES 5,000</li>
                          <li>• Tracking included</li>
                        </ul>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-6">
                        <h4 className="font-medium text-black mb-3">Express Delivery</h4>
                        <ul className="space-y-2 text-gray-600">
                          <li>• Same day delivery (Nairobi)</li>
                          <li>• KES 1,000 shipping fee</li>
                          <li>• Available Mon-Sat</li>
                          <li>• Signature required</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-black mb-4">International Shipping</h3>
                    <p className="text-gray-600 mb-4">
                      We ship to East Africa and select international destinations. Shipping costs and delivery times vary by destination.
                    </p>
                    <div className="bg-beige-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700">
                        <strong>Please note:</strong> International orders may be subject to customs duties and taxes, 
                        which are determined by your local customs office and are the responsibility of the customer.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-black mb-4">Order Processing</h3>
                    <p className="text-gray-600">
                      Orders are processed Monday through Saturday. Orders placed after 2pm Saturday will be processed 
                      the following Monday. You'll receive a confirmation email with tracking information once your 
                      order ships.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'returns' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-black mb-4">Return Policy</h3>
                    <p className="text-gray-600 mb-4">
                      We want you to love your Everything Maternity pieces. If you're not completely satisfied, 
                      you may return unworn items within 30 days of delivery.
                    </p>
                    
                    <div className="bg-sage-50 rounded-lg p-6 mb-6">
                      <h4 className="font-medium text-black mb-3">Return Requirements</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Items must be unworn and in original condition</li>
                        <li>• All original tags must be attached</li>
                        <li>• Items must be returned in original packaging</li>
                        <li>• Return within 30 days of delivery</li>
                      </ul>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-black mb-3">How to Return</h4>
                        <ol className="space-y-2 text-gray-600">
                          <li>1. Contact customer service for return authorization</li>
                          <li>2. Pack items securely in original packaging</li>
                          <li>3. Include return authorization number</li>
                          <li>4. Drop off at our store or authorized shipping location</li>
                        </ol>
                      </div>
                      <div>
                        <h4 className="font-medium text-black mb-3">Refund Timeline</h4>
                        <ul className="space-y-2 text-gray-600">
                          <li>• Refunds processed within 3-5 business days</li>
                          <li>• M-Pesa refunds: 1-2 business days</li>
                          <li>• Bank transfers: 3-5 business days</li>
                          <li>• Cash refunds: Available at store</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-black mb-4">Exchanges</h3>
                    <p className="text-gray-600 mb-4">
                      We're happy to exchange items for a different size or color, subject to availability. 
                      Exchange requests must be made within 30 days of delivery.
                    </p>
                    <div className="bg-beige-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700">
                        <strong>Final Sale Items:</strong> Intimate apparel and swimwear are final sale and 
                        cannot be returned or exchanged for hygiene reasons.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'care' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-black mb-4">General Care Guidelines</h3>
                    <p className="text-gray-600 mb-6">
                      Proper care ensures your Everything Maternity pieces maintain their beauty and quality for years to come.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-black mb-2">Washing Instructions</h4>
                          <ul className="space-y-1 text-gray-600 text-sm">
                            <li>• Turn garments inside out before washing</li>
                            <li>• Use cold water (30°C/86°F max)</li>
                            <li>• Use gentle cycle</li>
                            <li>• Wash similar colors together</li>
                            <li>• Use mild, pH-neutral detergent</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium text-black mb-2">Drying</h4>
                          <ul className="space-y-1 text-gray-600 text-sm">
                            <li>• Lay flat to dry away from direct sunlight</li>
                            <li>• Do not wring or twist wet garments</li>
                            <li>• Reshape while damp</li>
                            <li>• Avoid tumble drying unless specified</li>
                          </ul>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-black mb-2">Ironing & Steaming</h4>
                          <ul className="space-y-1 text-gray-600 text-sm">
                            <li>• Iron on reverse side when possible</li>
                            <li>• Use low to medium heat setting</li>
                            <li>• Steam is preferred over direct ironing</li>
                            <li>• Avoid ironing directly over prints or embellishments</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium text-black mb-2">Storage</h4>
                          <ul className="space-y-1 text-gray-600 text-sm">
                            <li>• Store in a cool, dry place</li>
                            <li>• Use padded hangers for structured pieces</li>
                            <li>• Fold knitwear to prevent stretching</li>
                            <li>• Keep away from direct sunlight</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-black mb-4">Fabric-Specific Care</h3>
                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-black mb-2">Silk</h4>
                        <p className="text-gray-600 text-sm">
                          Hand wash in cold water with silk-specific detergent or dry clean. Never wring or twist. 
                          Iron on low heat while slightly damp.
                        </p>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-black mb-2">Cashmere & Wool</h4>
                        <p className="text-gray-600 text-sm">
                          Hand wash in cold water with wool detergent. Lay flat to dry. Store folded with cedar sachets 
                          to prevent moths.
                        </p>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-black mb-2">Cotton & Cotton Blends</h4>
                        <p className="text-gray-600 text-sm">
                          Machine wash in cold water. Can be tumble dried on low heat. Iron while slightly damp for 
                          best results.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* FAQ Section */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-serif text-black mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      className="w-full px-6 py-4 text-left focus:outline-none focus:ring-2 focus:ring-black focus:ring-inset"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-black">{faq.question}</h3>
                        <span className="text-gray-400">
                          {expandedFaq === index ? '−' : '+'}
                        </span>
                      </div>
                    </button>
                    {expandedFaq === index && (
                      <div className="px-6 pb-4">
                        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerCarePage;