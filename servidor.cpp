#include <websocketpp/config/asio_no_tls.hpp>
#include <websocketpp/server.hpp>
#include <iostream>
#include <string>

using namespace std;
using websocketpp::lib::placeholders::_1;
using websocketpp::lib::placeholders::_2;
using websocketpp::lib::bind;

typedef websocketpp::server<websocketpp::config::asio> server;

// Define the callback functions for handling WebSocket events
void on_open(websocketpp::connection_hdl hdl) {
    cout << "Client connected" << endl;
}

void on_close(websocketpp::connection_hdl hdl) {
    cout << "Client disconnected" << endl;
}

void on_message(websocketpp::connection_hdl hdl, server::message_ptr msg, server* websocketServer) {
    cout << "Received message from client: " << msg->get_payload() << endl;
    
    // Echo the received message back to the client
    server::connection_ptr con = websocketServer->get_con_from_hdl(hdl);
    con->send(std::string("42"), msg->get_opcode()); // send a number to the client
    cout<<"Message 42 sent"<<endl;

}


int main() {
    // Create a WebSocket server instance
    server websocketServer;
    
    // Set the access channels to be logged
    websocketServer.set_access_channels(websocketpp::log::alevel::all);
    
    // Initialize the server
    websocketServer.init_asio();
    
    // Set the callback functions for handling WebSocket events
    websocketServer.set_open_handler(bind(&on_open, ::_1));
    websocketServer.set_close_handler(bind(&on_close, ::_1));
    websocketServer.set_message_handler(bind(&on_message, ::_1, ::_2, &websocketServer));

    
    // Listen on port 9002
    websocketServer.listen(8080);
    
    // Start the server accept loop
    websocketServer.start_accept();
    
    // Start the ASIO io_service run loop
    websocketServer.run();
    //g++ -I/websocketpp -o servidor servidor.cpp -lboost_system -lpthread
    //g++ -I. -o servidor servidor.cpp -lboost_system -lpthread

    return 0;
}
